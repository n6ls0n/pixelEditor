import LWWRegister from "./LWWRegister";

type Value<T> = {
    [key: string]: T;
};

type State<T> = {
    [key: string]: LWWRegister<T | null>["state"];
};

export default class LWWMap<T>{
    readonly id: string;
    #data = new Map<string, LWWRegister<T | null>>();

    // create a new register for each key in the initial state
    constructor(id:string, state: State<T>){
        this.id = id;
        for (const [key, register] of Object.entries(state)){
            this.#data.set(key, new LWWRegister(this.id, register));
        }
    }

    get value(){
        const value: Value<T> = {};

        // build up an object where each value is set to the full state of the register at the corresponding key
        for (const [key, register] of this.#data.entries()){
            if (register.value !== null) value[key] = register.value;
        }
        return value
        }

    get state(){
            const state: State<T> = {};

            // build up an object where each value is set to the full state of the register at the corresponding key
            for (const [key, register] of this.#data.entries()){
                if (register) state[key] = register.state;
            }

            return state;
        }

        // Helper function for "set" function below
    has(key: string){
            return this.#data.get(key)?.value !== null;
        }

        // Helper function for "set" function below
    get(key: string){
            return this.#data.get(key)?.value;
        }

        // Used to change the value if register it exists or create a new one
    set(key: string, value: T){
            const register = this.#data.get(key);

            if(register) register.set(value);

            else this.#data.set(key, new LWWRegister(this.id, [this.id, 1, value]));
        }

    delete(key: string){
            this.#data.get(key)?.set(null);
        }

    merge(state: State<T>){
        for (const [key, remote] of Object.entries(state)){
            const local = this.#data.get(key);

            if (local) local.merge(remote);

            else this.#data.set(key, new LWWRegister(this.id, remote));
        }
    }
}





