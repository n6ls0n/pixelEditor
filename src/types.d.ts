import LWWRegister from "./LWWRegister";

type Value<T> = {
    [key: string]: T;
};

// State<T> is a simple object where each "value" within the key-value pair is set to the full state of the register at the corresponding key
type State<T> = {
    [key: string]: LWWRegister<T | null>["state"];
};

type RGB = [red: number, green: number, blue:number];

type HexColor = `#${string & {length: 6}}`;
