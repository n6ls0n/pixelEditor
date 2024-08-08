import PixelEditor from "./PixelEditor";
import { HEX } from "./types";

// get alice's canvas
const acanvas = document.querySelector("#alice");
if (!(acanvas instanceof HTMLCanvasElement))
    throw new Error(`<canvas id="alice"> not found`);

// get bob's canvas
const bcanvas = document.querySelector("#bob");
if (!(bcanvas instanceof HTMLCanvasElement))
    throw new Error(`<canvas id="bob"> not found`);

// get the color input
const palette = document.querySelector('input[type="color"]');
if (!(palette instanceof HTMLInputElement))
    throw new Error(`<input type="color"> not found`);

// set the artboard size
const artboardSize = {w: 20, h: 20};

// instantiate the two PixelEditor classes
const alice = new PixelEditor(acanvas, artboardSize);
const bob = new PixelEditor(bcanvas, artboardSize);

alice.onchange = (state) => bob.receive(state);
bob.onchange = (state) => alice.receive(state);

// palette.oninput = () => {
//     const hex = palette.value.substring(1).match(/[\da-f]{2}/g) || [];
//     const rgb = hex.map((byte) => parseInt(byte, 16));
//     if (rgb.length === 3) alice.drawing_color = bob.drawing_color = rgb as RGB;
// };

palette.oninput = () => {
    const hex = palette.value.substring(1).match(/[\da-f]{2}/g) || [];
    if (hex.length === 3) {
      const hexColor = '#' + hex.join('');
      alice.drawing_color = bob.drawing_color = hexColor as unknown as HEX;
    }
  };



