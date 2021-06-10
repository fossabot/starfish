interface RectDescriptor {
    top: number;
    left: number;
    right: number;
    bottom: number;
}
export declare class Rect {
    top: number;
    left: number;
    right: number;
    bottom: number;
    constructor({ top, left, bottom, right, }: RectDescriptor);
    get width(): number;
    get height(): number;
}
export {};
//# sourceMappingURL=Rect.d.ts.map