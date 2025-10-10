/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const __wbg_wasmwallet_free: (a: number, b: number) => void;
export const wasmwallet_new: (a: number, b: number) => number;
export const wasmwallet_unlock: (a: number, b: number, c: number) => number;
export const wasmwallet_lock: (a: number) => void;
export const wasmwallet_is_unlocked: (a: number) => number;
export const wasmwallet_get_public_key: (a: number) => [number, number];
export const wasmwallet_sign_message: (a: number, b: number, c: number) => [number, number, number, number];
export const wasmwallet_to_json: (a: number) => [number, number];
export const wasmwallet_fromJson: (a: number, b: number) => [number, number, number];
export const __wbindgen_export_0: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_start: () => void;
