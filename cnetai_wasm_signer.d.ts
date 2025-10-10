/* tslint:disable */
/* eslint-disable */
/**
 * A simplified wallet structure designed to be used in a WASM environment.
 */
export class WasmWallet {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Creates a new wallet with a password
   */
  constructor(password: string);
  /**
   * Unlocks the wallet (simplified version)
   */
  unlock(_password: string): boolean;
  /**
   * Locks the wallet
   */
  lock(): void;
  /**
   * Checks if the wallet is currently unlocked
   */
  is_unlocked(): boolean;
  /**
   * Returns the public key
   */
  get_public_key(): string;
  /**
   * Signs a message (simplified version)
   */
  sign_message(message: string): string;
  /**
   * Exports the wallet data as a JSON string
   */
  to_json(): string;
  /**
   * Imports a wallet from a JSON string
   */
  static fromJson(json_str: string): WasmWallet;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmwallet_free: (a: number, b: number) => void;
  readonly wasmwallet_new: (a: number, b: number) => number;
  readonly wasmwallet_unlock: (a: number, b: number, c: number) => number;
  readonly wasmwallet_lock: (a: number) => void;
  readonly wasmwallet_is_unlocked: (a: number) => number;
  readonly wasmwallet_get_public_key: (a: number) => [number, number];
  readonly wasmwallet_sign_message: (a: number, b: number, c: number) => [number, number, number, number];
  readonly wasmwallet_to_json: (a: number) => [number, number];
  readonly wasmwallet_fromJson: (a: number, b: number) => [number, number, number];
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
