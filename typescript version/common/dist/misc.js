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
exports.default = {
    sleep,
    randomFromArray,
};
//# sourceMappingURL=misc.js.map