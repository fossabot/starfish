declare function sleep(ms: number): Promise<void>;
declare function randomFromArray<T>(array: T[]): T;
declare function randomWithWeights<E>(elements: {
    weight: number;
    value: E;
}[]): E;
declare function coinFlip(): boolean;
declare function debounce(fn: Function, time?: number): (...params: any[]) => void;
declare function shuffleArray(array: any[]): any[];
declare const _default: {
    sleep: typeof sleep;
    coinFlip: typeof coinFlip;
    randomFromArray: typeof randomFromArray;
    randomWithWeights: typeof randomWithWeights;
    debounce: typeof debounce;
    shuffleArray: typeof shuffleArray;
};
export default _default;
//# sourceMappingURL=misc.d.ts.map