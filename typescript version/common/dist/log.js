"use strict";
// const path = require(`path`)
Object.defineProperty(exports, "__esModule", { value: true });
const dim = `\x1b[2m`, reset = `\x1b[0m`;
const log = (...args) => {
    const pathName = /log\.[jt]s[^\n]*\n[^\n]*\/([^/]+\/[^/]+\/[^/:]+)\.[^:]+/gi.exec(`${new Error().stack}`)?.[1];
    console.log(dim + `[` + pathName + `]` + reset, ...args);
};
exports.default = log;
//# sourceMappingURL=log.js.map