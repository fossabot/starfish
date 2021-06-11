"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeMase = void 0;
const Rect_1 = require("./Rect");
const misc_1 = __importDefault(require("../misc"));
class FreeMase {
    constructor(parentEl) {
        this.maxHeight = 99999;
        this.parentEl = parentEl;
        this.maxWidth = parentEl.offsetWidth;
        this.window = window;
        if (!window)
            return;
        this.window.addEventListener(`resize`, misc_1.default.debounce(() => {
            this.position();
        }), {
            passive: true,
        });
        this.position();
    }
    async position() {
        const startTime = Date.now();
        // c.log(`resetting positions`)
        this.parentEl.setAttribute(`style`, `width: 100%;`);
        this.maxWidth = this.parentEl.offsetWidth;
        let availableSpaces = [
            new Rect_1.Rect({
                top: 0,
                left: 0,
                right: this.maxWidth,
                bottom: this.maxHeight,
            }),
        ];
        const takenSpaces = [];
        for (let i = 0; i < this.parentEl.children.length; i++) {
            const element = this.parentEl.children[i];
            element.setAttribute(`style`, `position: absolute; top: 0; left: 0;`);
        }
        const placeOneFrame = (element) => {
            const elBcr = element.getBoundingClientRect();
            const firstFitIndex = availableSpaces.findIndex((space) => {
                if (elBcr.width > space.width)
                    return false;
                if (elBcr.height > space.height)
                    return false;
                return true;
            });
            if (firstFitIndex === -1)
                return;
            const firstFit = availableSpaces[firstFitIndex];
            element.setAttribute(`style`, `position: absolute; top:${firstFit.top}px; left: ${firstFit.left}px;  opacity: 1;`);
            const placedRect = new Rect_1.Rect({
                top: firstFit.top,
                left: firstFit.left,
                bottom: firstFit.top + elBcr.height,
                right: firstFit.left + elBcr.width,
            });
            takenSpaces.push(placedRect);
            // c.log(`---`)
            // c.log(`placing:`, element)
            // c.log(`placing in rect`, placedRect)
            // recalculate available spaces
            availableSpaces = [];
            let doneAddingNewAvailableSpaces = false;
            let searchTop = 0;
            const getNewSearchTop = (next, takenRect) => {
                if (takenRect.bottom < next &&
                    takenRect.bottom > searchTop)
                    return takenRect.bottom;
                return next;
            };
            while (!doneAddingNewAvailableSpaces) {
                let aligned = [];
                // find all that hit one horizontal line
                for (let takenRect of takenSpaces) {
                    const verticallyAligned = searchTop >= takenRect.top &&
                        searchTop < takenRect.bottom;
                    if (verticallyAligned)
                        aligned.push(takenRect);
                }
                // if nothing found, end
                if (!aligned.length) {
                    doneAddingNewAvailableSpaces = true;
                    continue;
                }
                // find the gaps
                const foundSpans = [];
                for (let takenRect of aligned) {
                    // check left
                    if (takenRect.left > 0) {
                        const nextToTheLeft = aligned.reduce((next, otherRect) => {
                            if (otherRect === takenRect)
                                return next;
                            if (otherRect.right <= takenRect.left &&
                                (!next || otherRect.right > next.right)) {
                                return otherRect;
                            }
                            return next;
                        }, null);
                        if (nextToTheLeft &&
                            nextToTheLeft.right < takenRect.left) {
                            // there's a gap!
                            foundSpans.push({
                                left: nextToTheLeft.right,
                                right: takenRect.left,
                            });
                        }
                        else if (!nextToTheLeft) {
                            foundSpans.push({
                                left: 0,
                                right: takenRect.left,
                            });
                        }
                    }
                    // check right
                    const nextToTheRight = aligned.reduce((next, otherRect) => {
                        if (otherRect === takenRect)
                            return next;
                        if (otherRect.left >= takenRect.right &&
                            (!next || otherRect.left < next.left)) {
                            return otherRect;
                        }
                        return next;
                    }, null);
                    if (nextToTheRight &&
                        nextToTheRight.left > takenRect.right) {
                        // there's a gap!
                        foundSpans.push({
                            left: takenRect.right,
                            right: nextToTheRight.left,
                        });
                    }
                    else if (!nextToTheRight &&
                        takenRect.right !== this.maxWidth) {
                        foundSpans.push({
                            left: takenRect.right,
                            right: this.maxWidth,
                        });
                    }
                }
                // c.log(`gaps`, foundSpans)
                // get the max heights for the gaps
                for (let { left, right } of foundSpans) {
                    let top = searchTop;
                    let bottom = this.maxHeight;
                    for (let takenRect of takenSpaces) {
                        if (takenRect.left >= right ||
                            takenRect.right <= left)
                            continue;
                        if (takenRect.bottom <= top)
                            continue;
                        if (takenRect.top < bottom)
                            bottom = takenRect.top;
                    }
                    // add the available space rect
                    if (bottom !== top)
                        availableSpaces.push(new Rect_1.Rect({ top, bottom, left, right }));
                }
                // get new search starting horizontal line
                searchTop = aligned.reduce(getNewSearchTop, this.maxHeight);
                if (searchTop === this.maxHeight)
                    doneAddingNewAvailableSpaces = true;
            }
            // add bottom available space
            const lastTakenSpace = takenSpaces.reduce((last, curr) => {
                if (curr.bottom > last.bottom)
                    return curr;
                return last;
            }, takenSpaces[0]) || { bottom: 0 };
            availableSpaces.push(new Rect_1.Rect({
                top: lastTakenSpace.bottom,
                bottom: this.maxHeight,
                left: 0,
                right: this.maxWidth,
            }));
            // c.log(`available spaces:`, availableSpaces)
        };
        for (let i = 0; i < this.parentEl.children.length; i++) {
            const element = this.parentEl.children[i];
            await new Promise((resolve) => {
                // this.window.requestAnimationFrame(() => {
                placeOneFrame(element);
                resolve();
                // })
            });
            // debugger
        }
        const lastTakenSpace = takenSpaces.reduce((last, curr) => {
            if (curr.bottom > last.bottom)
                return curr;
            return last;
        }, takenSpaces[0])?.bottom || 0;
        this.parentEl.setAttribute(`style`, `width: 100%; height: ${lastTakenSpace}px;`);
        const elapsedTime = Date.now() - startTime;
        // c.log(`elapsed time: ${elapsedTime}`)
    }
}
exports.FreeMase = FreeMase;
//# sourceMappingURL=FreeMase.js.map