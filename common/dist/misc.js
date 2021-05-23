"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function coinFlip() {
    return Math.random() > 0.5;
}
exports.default = {
    sleep,
    coinFlip,
    randomFromArray,
};
//# sourceMappingURL=misc.js.map