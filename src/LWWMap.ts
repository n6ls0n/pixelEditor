import LWWRegister from "./LWWRegister";
import { Value, State, RGB } from "./types";


// This class is used as the key-value store for color data in the PixelData class.
export default class LWWMap<T>{
    readonly id: string;
    #data = new Map<string, LWWRegister<T | null>>();

    // create a new register from each key in the initial state
    constructor(id:string, state: State<T>){
        this.id = id;
        for (const [key, register] of Object.entries(state)){
            this.#data.set(key, new LWWRegister(this.id, register));
        }
    }

    // returns a subset of the #data map where the values are not null.
    get value(){
        const value: Value<T> = {};
        for (const [key, register] of this.#data.entries()){
            if (register.value !== null) value[key] = register.value;
        }
        return value
        }

    // It retrieves the state of all non-null registers and returns it as a State<T> object.
    get state(){
        const state: State<T> = {};
        for (const [key, register] of this.#data.entries()){
            if (register) state[key] = register.state;
        }
        return state;
        }

    // Checks is a "key" exists within the "#data" map and if it does, it returns the value.
    get(key: string){
            return this.#data.get(key)?.value;
        }

    // Used to set the value of a register if it exists or create a new one otherwise
    set(key: string, value: T){
            const register = this.#data.get(key);
            if(register) {
                register.set(value);
            }
            else {
                this.#data.set(key, new LWWRegister(this.id, [this.id, 1, value]));
            }
        }

    // Used to "delete" a register if exists by the setting the value to null
    delete(key: string){
            this.#data.get(key)?.set(null);
        }

    // This takes State<T> and merges it with the current state. It does this by creating a new LWWRegister from each key in the state and merging it with the corresponding register in the current state.
    merge(state: State<T>){
        for (const [key, remote] of Object.entries(state)){
            const local = this.#data.get(key);

            if (local) local.merge(remote);

            else this.#data.set(key, new LWWRegister(this.id, remote));
        }
    }
}





