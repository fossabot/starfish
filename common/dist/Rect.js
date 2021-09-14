"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = void 0;
class Rect {
    constructor({ top, left, bottom, right, }) {
        this.top = top;
        this.left = left;
        this.bottom = bottom;
        this.right = right;
    }
    get width() {
        return this.right - this.left;
    }
    get height() {
        return this.bottom - this.top;
    }
}
exports.Rect = Rect;
//# sourceMappingURL=Rect.js.map