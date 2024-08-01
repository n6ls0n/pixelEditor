import LWWMap from "./LWWWMap";

export type RGB = [red: number, green: number, blue:number];

export default class PixelData {
    readonly id: string;
    #data: LWWMap<RGB>;

    constructor (id: string = crypto.randomUUID()){
        this.id = id;
        this.#data = newLWWMap(this.id, {})
    }
}
