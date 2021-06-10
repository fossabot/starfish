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
function debounce(fn, time = 500) {
    let timeout;
    return (...params) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn(...params);
        }, time);
    };
}
exports.default = {
    sleep,
    coinFlip,
    randomFromArray,
    debounce,
};
//# sourceMappingURL=misc.js.map