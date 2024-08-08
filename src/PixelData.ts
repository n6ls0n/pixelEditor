import LWWMap from "./LWWMap";
import { RGB, HEX } from "./types";

export default class PixelData {
    readonly id: string;
    #data: LWWMap<HEX>;

    constructor (id: string = crypto.randomUUID()){
        this.id = id;
        this.#data = new LWWMap(this.id, {})
    }


    static key(x: number, y: number){
        return `${x},${y}`;
    }

    get value(){
        return this.#data.value;
    }

    get state(){
        return this.#data.state;
    }

    set(x: number, y:number, value: HEX){
        const key = PixelData.key(x,y);
        this.#data.set(key, value);
    }

    get(x:number, y:number): HEX{
        const key = PixelData.key(x,y);

        const register = this.#data.get(key);
        return register ??  ["#FFFFFF"]
    }

    delete(x: number, y:number){
        const key = PixelData.key(x,y);
        this.#data.delete(key);
    }

    merge(state: PixelData["state"]){
    this.#data.merge(state);
    }
}
