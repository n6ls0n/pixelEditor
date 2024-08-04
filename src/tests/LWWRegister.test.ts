import {describe, expect, test} from '@jest/globals';
import LWWRegister from "../LWWRegister";
import {Value, State, RGB} from "../types";


describe("LWWRegister", () => {
    test("value", () => {
        const color: RGB = [0, 0, 0];
        const id = "test";
        const register_state: [string, number, RGB] = [id, 0, color];
        const register = new LWWRegister(id, register_state);
        expect(register.value).toEqual([0, 0, 0]);
    });
    test("Constructor", () => {
        const id = "test";
        const color: RGB = [0, 0, 0];
        const register_state: [string, number, RGB] = [id, 0, color];

        const register = new LWWRegister(id, register_state);

        expect(register.id).toEqual(id);
        expect(register.state).toEqual(register_state);
    });

    test("set", () => {
        const id = "test";
        const color: RGB = [0, 0, 0];
        const register_state: [string, number, RGB] = [id, 0, color];

        const register = new LWWRegister(id, register_state);

        const newColor: RGB = [255, 255, 255];
        register.set(newColor);

        expect(register.state).toEqual([id, 1, newColor]);
    });

    test("merge_local>remote", () => {
        const id = "test";
        const color: RGB = [0, 0, 0];
        const register_state: [string, number, RGB] = [id, 1, color];

        const register = new LWWRegister(id, register_state);

        const newColor: RGB = [255, 255, 255];
        const newRegisterState: [string, number, RGB] = [id, 0, newColor];

        register.merge(newRegisterState);

        expect(register.state).toEqual(register_state);

    });

    test("merge_local===remote&&localpeer>remotepeer", () => {
        const id = "test";
        const local_id = "b";
        const remote_id = "a";

        const color: RGB = [0, 0, 0];
        const register_state: [string, number, RGB] = [local_id, 0, color];

        const register = new LWWRegister(id, register_state);

        const newColor: RGB = [255, 255, 255];
        const newRegisterState: [string, number, RGB] = [remote_id, 0, newColor];

        register.merge(newRegisterState);

        expect(register.state).toEqual(register_state);
    });

    test("merge_local<remote", () => {
        const id = "test";
        const color: RGB = [0, 0, 0];
        const register_state: [string, number, RGB] = [id, 0, color];

        const register = new LWWRegister(id, register_state);

        const newColor: RGB = [255, 255, 255];
        const newRegisterState: [string, number, RGB] = [id, 1, newColor];

        register.merge(newRegisterState);

        expect(register.state).toEqual(newRegisterState);
    });
});
