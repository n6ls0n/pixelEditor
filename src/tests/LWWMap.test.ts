import {describe, expect, test} from '@jest/globals';
import { HEX } from "../types";
import LWWMap from "../LWWMap";
import LWWRegister from '../LWWRegister';

// Globals for testing
const register_id1 = "id1";
const register_id2 = "id2";
const register_id3 = "id3";


const map_id = "map_id";

const value1: HEX = ["#000000"];
const value2: HEX = ["#00FF00"]; 
const value3: HEX = ["#FF0000"];
const value4: HEX = ["#0000FF"];

const register_state1: [string, number, HEX] = ["a", 0, value1];
const register_state2: [string, number, HEX] = ["b", 1, value2];
const register_state3: [string, number, HEX] = ["c", 0, value3];
const register_state4: [string, number, HEX] = ["d", 1, value4];

const register_state_object = {[register_id1]: register_state1, [register_id2]: register_state2};

const register_state_object_new_states = {[register_id1]: register_state3, [register_id2]: register_state4};

const register_state_object_new_registers = {[register_id3]: register_state3};

const register_value_object = {[register_id1]: value1, [register_id2]: value2};



describe ("LWWMap", () => {

    test("Constructor", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        expect(map1.id).toEqual(map_id);
        expect(map1.state).toEqual(register_state_object);
    });

    test("getter_value", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        expect(map1.value).toEqual(register_value_object);
    });

    test("getter_state", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        expect(map1.state).toEqual(register_state_object);
    });

    test("set_new", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        map1.set(register_id3, value1);
        expect(map1.get(register_id3)).toEqual(value1);
    });

    test("set_existing", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        map1.set(register_id2, value3);
        expect(map1.get(register_id2)).toEqual(value3);
    });

    test("delete", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        map1.delete(register_id1);
        expect(map1.get(register_id1)).toEqual(null);
    });

    test("merge_local_exists", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        map1.merge(register_state_object_new_states);
        expect(map1.get(register_id1)).toEqual(value3);
        expect(map1.get(register_id2)).toEqual(value4);
    });

    test("merge_local_doesn't exist", () => {
        const map1 = new LWWMap(map_id, register_state_object);
        map1.merge(register_state_object_new_registers);
        expect(map1.get(register_id3)).toEqual(value3);
    });
});

