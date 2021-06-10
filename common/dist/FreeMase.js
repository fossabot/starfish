"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeMase = void 0;
const Rect_1 = require("./Rect");
const debounce = (fn, time = 500) => {
    let timeout;
    return (...params) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn(...params);
        }, time);
    };
};
class FreeMase {
    constructor(parentEl) {
        this.maxHeight = 99999;
        this.parentEl = parentEl;
        this.maxWidth = parentEl.offsetWidth;
        this.window = window;
        if (!window)
            return;
        this.window.addEventListener(`resize`, debounce(this.resetPositions), {
            passive: true,
        });
        this.resetPositions();
    }
    resetPositions() {
        const startTime = Date.now();
        console.log(`resetting positions`);
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
            const elBcr = element.getBoundingClientRect();
            const firstFitIndex = availableSpaces.findIndex((space) => doesFit(elBcr, space));
            if (firstFitIndex === -1)
                continue;
            const firstFit = availableSpaces[firstFitIndex];
            element.setAttribute(`style`, `position: absolute; top:${firstFit.top}px; left: ${firstFit.left}px;`);
            const placedRect = new Rect_1.Rect({
                top: firstFit.top,
                left: firstFit.left,
                bottom: firstFit.top + elBcr.height,
                right: firstFit.left + elBcr.width,
            });
            takenSpaces.push(placedRect);
            console.log(`placing in rect`, placedRect);
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
                            right: takenRect.left,
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
                // get the max heights for the gaps
                for (let { left, right } of foundSpans) {
                    let top = searchTop;
                    let bottom = this.maxHeight;
                    for (let takenRect of takenSpaces) {
                        if (takenRect.left > right ||
                            takenRect.right < left)
                            continue;
                        if (takenRect.bottom < top)
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
                console.log(`available spaces:`, availableSpaces);
            }
        }
        const elapsedTime = Date.now() - startTime;
        console.log(`elapsed time: ${elapsedTime}`);
    }
}
exports.FreeMase = FreeMase;
function doesFit(elBcr, space) {
    if (elBcr.width > space.width)
        return false;
    if (elBcr.height > space.height)
        return false;
    return true;
}
function intersects(r1, r2) {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}
//# sourceMappingURL=FreeMase.js.map