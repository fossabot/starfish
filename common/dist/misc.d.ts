declare function sleep(ms: number): Promise<void>;
declare function randomFromArray(array: any[]): any;
declare function coinFlip(): boolean;
declare function debounce(fn: Function, time?: number): (...params: any[]) => void;
declare const _default: {
    sleep: typeof sleep;
    coinFlip: typeof coinFlip;
    randomFromArray: typeof randomFromArray;
    debounce: typeof debounce;
};
export default _default;
//# sourceMappingURL=misc.d.ts.map