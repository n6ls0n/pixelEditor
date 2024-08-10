import {describe, expect, test} from '@jest/globals';
import LWWRegister from "../LWWRegister";
import {Value, State, HEX} from "../types";


describe("LWWRegister", () => {
    test("value", () => {
        const color: HEX = ["#000000"];
        const id = "test";
        const register_state: [string, number, HEX] = [id, 0, color];
        const register = new LWWRegister(id, register_state);
        expect(register.value).toEqual(["#000000"]);
    });
    test("Constructor", () => {
        const id = "test";
        const color: HEX = ["#000000"];
        const register_state: [string, number, HEX] = [id, 0, color];

        const register = new LWWRegister(id, register_state);

        expect(register.id).toEqual(id);
        expect(register.state).toEqual(register_state);
    });

    test("set", () => {
        const id = "test";
        const color: HEX = ["#000000"];
        const register_state: [string, number, HEX] = [id, 0, color];

        const register = new LWWRegister(id, register_state);

        const newColor: HEX = ["#FFFFFF"];
        register.set(newColor);

        expect(register.state).toEqual([id, 1, newColor]);
    });

    test("merge_local>remote", () => {
        const id = "test";
        const color: HEX = ["#000000"];
        const register_state: [string, number, HEX] = [id, 1, color];

        const register = new LWWRegister(id, register_state);

        const newColor: HEX = ["#FFFFFF"];
        const newRegisterState: [string, number, HEX] = [id, 0, newColor];

        register.merge(newRegisterState);

        expect(register.state).toEqual(register_state);

    });

    test("merge_local===remote&&localpeer>remotepeer", () => {
        const id = "test";
        const local_id = "b";
        const remote_id = "a";

        const color: HEX = ["#000000"];
        const register_state: [string, number, HEX] = [local_id, 0, color];

        const register = new LWWRegister(id, register_state);

        const newColor: HEX = ["#FFFFFF"];
        const newRegisterState: [string, number, HEX] = [remote_id, 0, newColor];

        register.merge(newRegisterState);

        expect(register.state).toEqual(register_state);
    });

    test("merge_local<remote", () => {
        const id = "test";
        const color: HEX = ["#000000"];
        const register_state: [string, number, HEX] = [id, 0, color];

        const register = new LWWRegister(id, register_state);

        const newColor: HEX = ["#FFFFFF"];
        const newRegisterState: [string, number, HEX] = [id, 1, newColor];

        register.merge(newRegisterState);

        expect(register.state).toEqual(newRegisterState);
    });
});
