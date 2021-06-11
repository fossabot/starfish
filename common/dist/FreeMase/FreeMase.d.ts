interface FreeMaseOptions {
    centerX?: boolean;
}
export declare class FreeMase {
    parentEl: HTMLElement;
    maxWidth: number;
    maxHeight: number;
    window: Window;
    options?: FreeMaseOptions;
    constructor(parentEl: HTMLElement, options?: FreeMaseOptions);
    position(): Promise<void>;
}
export {};
//# sourceMappingURL=FreeMase.d.ts.map