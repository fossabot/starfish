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
function shuffleArray(array) {
    const toReturn = [...array];
    for (let i = toReturn.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [toReturn[i], toReturn[j]] = [toReturn[j], toReturn[i]];
    }
    return toReturn;
}
exports.default = {
    sleep,
    coinFlip,
    randomFromArray,
    debounce,
    shuffleArray,
};
//# sourceMappingURL=misc.js.map