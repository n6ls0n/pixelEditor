import PixelData from "./PixelData";
import { RGB, HEX} from "./types";

export default class PixelEditor{
    // ####### INSTANCE PROPERTIES ########

    // The underlying <canvas> element
    #canvas_element: HTMLCanvasElement;

    // The 2D canvas rendering context
    #rendering_context: CanvasRenderingContext2D;

    // The artboard size, in drawable pixels
    #artboard: {w: number, h: number};

    // The underlying pixel data
    #pixel_data = new PixelData();

    // The selected color
    #drawing_color: HEX = ["#000000"];
    // #drawing_color: RGB = [0,0,0]; This is the RGB equivalent

    // The previous position of the mouse cursor
    #prev_cursor_position: [x: number, y: number] | undefined;

    // The set of pixel keys that have been painted during the current drag operation
    #painted_pixels_key_set = new Set<string>();

    // An array of listener functions  that will be called for change events
    #listeners: Array<(state: PixelData["state"]) => void> = [];

    // ####### METHODS ##########
    constructor(canvas_element: HTMLCanvasElement, artboard: { w: number, h: number }){
        // get the HTML Canvas Element
        this.#canvas_element = canvas_element;

        //  get the 2d rendering context
        const rendering_context = canvas_element.getContext("2d");
        if(!rendering_context) throw new Error("Couldn't get rendering context");
        this.#rendering_context = rendering_context;

        //  store the artboard size
        this.#artboard = artboard;

        // listen for pointer events
        this.#canvas_element.addEventListener("pointerdown", this);
        this.#canvas_element.addEventListener("pointermove", this);
        this.#canvas_element.addEventListener("pointerup", this);

        //  resize the canvas
        this.#canvas_element.width = this.#canvas_element.clientWidth * devicePixelRatio
        this.#canvas_element.height = this.#canvas_element.clientHeight * devicePixelRatio
        this.#rendering_context.scale(devicePixelRatio, devicePixelRatio);
        this.#rendering_context.imageSmoothingEnabled = false;
    }

    // Appends a listener to be called when the state changes
    // @param listener - this is an arrow function that takes a single parameter (state of type PixelData["state"]) and returns void
    set onchange(listener: (state: PixelData["state"]) => void){
        this.#listeners.push(listener);
    }

    //  Sets the drawing color for the object instance of the PixelEditor class
    set drawing_color(drawing_color: HEX){
        this.#drawing_color = drawing_color;
    }

    // There are 3 event types: pointerdown, pointermove, and pointerup that are fired when the mouse is pressed, moved, and released.  This function contains a switch statement that handles each of these events.
    handleEvent(pointer_event: PointerEvent){
        switch (pointer_event.type){
            // @ts-expect-error
            case "pointerdown":{
                this.#canvas_element.setPointerCapture(pointer_event.pointerId);
                // "fallthrough" is a keyword in switch statements that allows the code to move to the next case without breaking out of the switch.
                // fallthrough
            }
            // This eslint-disable-next-line comment is used to disable an eslint rule that is applicable to this line of code. In this case, it is disabling the rule that warns about fallthrough cases in a switch statement.
            // eslint-disable-next-line no-fallthrough
            case "pointermove":{
                if (!this.#canvas_element.hasPointerCapture(pointer_event.pointerId)) return;

                const x = Math.floor((this.#artboard.w * pointer_event.offsetX) / this.#canvas_element.clientWidth),
                y = Math.floor( (this.#artboard.h * pointer_event.offsetY) / this.#canvas_element.clientHeight
                );
                this.#paint(x, y);
                this.#prev_cursor_position = [x,y];
                break;
            }

            case "pointerup":{
                this.#canvas_element.releasePointerCapture(pointer_event.pointerId);
                this.#prev_cursor_position = undefined;
                this.#painted_pixels_key_set.clear();
                break;
            }
        }
    }

    // Checks if a pixel has been painted during the current drag operation
    // @param x X coordinate of the target pixel
    // @param y Y coordinate of the target pixel
    // Used inside the #paint method
    // Returns true if the pixel has been painted, false otherwise
    #checkPainted(x: number, y: number) {
        // Get the key of the target pixel. Recall, the key is the string representation of the x and y coordinates separated by a comma.
        const key = PixelData.key(x,y);
        // Check if the key is within the set of keys that have been painted during the current drag operation
        const painted = this.#painted_pixels_key_set.has(key);
        // Add the key to the set of keys that have been painted during the current drag operation. Since this is a set, if the key is present, nothing happens. If the key is not present, the key is added to the set.
        this.#painted_pixels_key_set.add(key);
        return painted;
    }

    // Sets pixel under the mouse cursor with the current color
    // @param x X coordinate of the target pixel
    // @param y Y coordinate of the target pixel
    #paint(x: number, y: number){
        // Check if the coordinates are within the bounds of the artboard
        if (x < 0 || this.#artboard.w <= x) return;
        if (y < 0 || this.#artboard.h <= y) return;

        // Checks is the pixel at the (x,y) coordinate has already been painted. If it has, the method returns without doing anything. If it hasn't, the method proceeds to set the pixel.
        if(!this.#checkPainted(x,y)) this.#pixel_data.set(x,y, this.#drawing_color);

        // Sets the value of [x0,y0] to either the previous cursor position or if that is undefined then to the current cursor position [x,y].
        let [x0, y0] = this.#prev_cursor_position || [x, y];

        // Calculates the difference between the current cursor position and the previous cursor position
        const dx = x - x0, dy = y - y0;

        // Converts the x and y deltas to whole numbers (necessary incase the deltas are not whole numbers or are negative) and then gets the max of the two values.
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        // The max value stored above is the number of steps the cursor will move in the x and y directions. The x and y increments (xinc and yinc) are then calculated by dividing the delta values (dx and dy) by the number of steps.
        const x_inc = dx / steps, y_inc = dy / steps;

        // A for loop that starts from the previous cursor position and moves to the current cursor position in the x and y directions based on the number of steps
        for (let i = 0; i < steps; i++){
            // Adds the increments to the previous cursor position to get the next cursor position
            x0 += x_inc;
            y0 += y_inc;

            // Rounds the cursor position to the nearest whole number
            const x1 = Math.round(x0);
            const y1 = Math.round(y0);

            // Adds the key of the next cursor position (x1,y1) to the set of keys that have been painted during the current drag operation via the #checkPainted method
            if(!this.#checkPainted(x1,y1)) this.#pixel_data.set(x1, y1, this.#drawing_color);
        }
        // Redraw the canvas using the updated pixel data state
        this.#draw();
        this.#notify();
        }


    // Draw each pixel on the canvas by loading the color data from the PixelData class into the appropriate pixel buffer on the canvas
    async #draw(){
        //  The number of channels per pixel; R, G, B, A
        const pixel_color_channels = 4;

        //  Create a buffer to hold the raw pixel data.
        //  Each pixel corresponds to four bytes in the buffer, one for each color channel. So the entire buffer will be 4 * w * h bytes. Assuming height and width of 100 pixels, the buffer will contain 4000 bytes.
        const buffer = new Uint8ClampedArray( this.#artboard.w * this.#artboard.h * pixel_color_channels);

        // The number of bytes in the buffer representing a single artboard row. Assuming the artboard is 100x100, the row size will be  400 bytes.
        const row_size = this.#artboard.w * pixel_color_channels;

        //  A for loop that loops through all the rows in the artboard
        for (let row =0; row < this.#artboard.h; row++){
            // Calculate the byte offset for the start of the current row within the main buffer
            const offsetY = row * row_size;

            //  A for loop that loops through all the columns of the current row
            for(let col = 0; col < this.#artboard.w; col++){
                // calculate the byte offset for the current column within the current row
                const offsetX = col * pixel_color_channels;

                // The byte offset within the buffer for the current pixel
                const offset = offsetY + offsetX;

                // This is where the conversion from hex would take place
                const hex_value = this.#pixel_data.get(col, row);
                const rgbArray = this.hexToRgb(hex_value);
                if (rgbArray !== null) {
                console.log(rgbArray); // Output: [255, 0, 0]
                const [r, g, b] = rgbArray;
                buffer[offset] = r;
                buffer[offset + 1] = g;
                buffer[offset + 2] = b;
                buffer[offset + 3] = 255;
                }
            }
        }

        // The data variable is used to hold an ImageData object that can be used to create an ImageBitmap object
        const data = new ImageData(buffer, this.#artboard.w, this.#artboard.h);
        const bitmap = await createImageBitmap(data);
        this.#rendering_context.drawImage(
            bitmap,
            0,
            0,
            this.#canvas_element.clientWidth,
            this.#canvas_element.clientHeight
        );
    }

    hexToRgb(hex: HEX) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.toString());
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : null;
      }

    //  Notify all listeners that the state has changed
    #notify(){
        const state = this.#pixel_data.state;
        for (const listener of this.#listeners) listener(state);
    }

    // Merge remote state with the current state and redraw the canvas
    //  @param state State to merge into the current state
    receive(state: PixelData["state"]){
        this.#pixel_data.merge(state);
        this.#draw();
    }



    // rgbToHex(rgb: RGB): string {
    //     const { r, g, b } = rgb;
    //     const componentToHex = (c) => {
    //         const hex = c.toString(16);
    //         return hex.length === 1 ? "0" + hex : hex;
    //     };
    //     return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
    // }


}
