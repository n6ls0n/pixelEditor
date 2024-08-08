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
    #drawing_color: RGB = [0,0,0];

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

    //  Sets the drawing color
    set drawing_color(drawing_color: RGB){
        this.#drawing_color = drawing_color;
    }

    handleEvent(e: PointerEvent){
        switch (e.type){
            // @ts-expect-error
            case "pointerdown":{
                this.#canvas_element.setPointerCapture(e.pointerId);
                // "fallthrough" is a keyword in switch statements that allows the code to move to the next case without breaking out of the switch.
                // fallthrough
            }
            // This eslint-disable-next-line comment is used to disable an eslint rule that is applicable to this line of code. In this case, it is disabling the rule that warns about fallthrough cases in a switch statement.
            // eslint-disable-next-line no-fallthrough
            case "pointermove":{
                if (!this.#canvas_element.hasPointerCapture(e.pointerId)) return;

                const x = Math.floor((this.#artboard.w * e.offsetX) / this.#canvas_element.clientWidth),
                y = Math.floor( (this.#artboard.h * e.offsetY) / this.#canvas_element.clientHeight
                );
                this.#paint(x, y);
                this.#prev_cursor_position = [x,y];
                break;
            }

            case "pointerup":{
                this.#canvas_element.releasePointerCapture(e.pointerId);
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
    //
    #checkPainted(x: number, y: number) {
        const key = PixelData.key(x,y);
        const painted = this.#painted_pixels_key_set.has(key);
        this.#painted_pixels_key_set.add(key);
        return painted;
    }

    // Sets pixel under the mouse cursor with the current color
    // @param x X coordinate of the target pixel
    // @param y Y coordinate of the target pixel
    #paint(x: number, y: number){
        if (x < 0 || this.#artboard.w <= x) return;
        if (y < 0 || this.#artboard.h <= y) return;

        if(!this.#checkPainted(x,y)) this.#pixel_data.set(x,y, this.#drawing_color);

        let [x0, y0] = this.#prev_cursor_position || [x, y];

        const dx = x - x0, dy = y - y0;

        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const xinc = dx / steps, yinc = dy / steps;

        for (let i = 0; i < steps; i++){
            x0 += xinc;
            y0 += yinc;
            const x1 = Math.round(x0);
            const y1 = Math.round(y0);

            if(!this.#checkPainted(x1,y1)) this.#pixel_data.set(x1, y1, this.#drawing_color);
        }

        this.#draw();
        this.#notify();
        }


    // Draw each pixel on the canvas by loading the color data from the PixelData class into the appropriate pixel buffer on the canvas
    async #draw(){
        //  The number of channels per pixel; R, G, B, A
        const chans = 4;

        //  A buffer to hold the raw pixel data.
        //  Each pixel corresponds to four bytes in the buffer, so the full size is the number of pixels times the number of channels per pixel
        const buffer = new Uint8ClampedArray( this.#artboard.w * this.#artboard.h * chans);

        // The number of bytes in the buffer representing a single artboard row
        const rowsize = this.#artboard.w * chans;

        for (let row =0; row < this.#artboard.h; row++){
            // Calculate the byte offset of the start of the row relative to the start of the buffer
            const offsetY = row * rowsize;

            for(let col = 0; col < this.#artboard.w; col++){
                // calculate the byte offset of the pixel relative to the start of the buffer
                const offsetX = col * chans;

                const offset = offsetY + offsetX;

                // This is where the conversion from hex would take place
                // E.g.
                const [r, g, b] = this.#pixel_data.get(col, row);
                buffer[offset] = r;
                buffer[offset + 1] = g;
                buffer[offset + 2] = b;
                buffer[offset + 3] = 255;
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

    // setPixelColor(x, y, hexColor) {
    //     const rgb = hexToRgb(hexColor);
    //     if (rgb) {
    //       const index = (y * width + x) * 4;
    //       data[index] = rgb.r;
    //       data[index + 1] = rgb.g;
    //       data[index + 2] = rgb.b;
    //       data[index + 3] = 255; // Alpha (fully opaque)
    //     }
    //   }

    // rgbToHex(rgb: RGB): string {
    //     const { r, g, b } = rgb;
    //     const componentToHex = (c) => {
    //         const hex = c.toString(16);
    //         return hex.length === 1 ? "0" + hex : hex;
    //     };
    //     return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
    // }

    // function hexToRgb(hex) {
    //     const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    //     if (match) {
    //       return {
    //         r: parseInt(match[1], 16),
    //         g: parseInt(match[2], 16),
    //         b: parseInt(match[3], 16)
    //       };
    //     }
    //     return null;
    //   }
}
