import LWWRegister from "./LWWRegister";

type Value<T> = {
    [key: string]: T;
};

// State<T> is a simple object where each "value" within the key-value pair is set to the full state of the register at the corresponding key
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

    // Helper function for "set" function below.Checks is a "key" exists within the "#data" map and if it does, it returns the value.
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





