interface FreeMaseOptions {
    centerX?: boolean;
}
export declare class FreeMase {
    parentEl: HTMLElement;
    maxWidth: number;
    maxHeight: number;
    window: Window;
    options?: FreeMaseOptions;
    resizeObserver: ResizeObserver | null;
    mutationObserver: MutationObserver | null;
    watchingForResize: Element[];
    constructor(parentEl: HTMLElement, options?: FreeMaseOptions);
    setup(): Promise<void>;
    position(): Promise<number>;
}
export {};
//# sourceMappingURL=FreeMase.d.ts.map