"use strict";
// const path = require(`path`)
Object.defineProperty(exports, "__esModule", { value: true });
const dim = `\x1b[2m`, reset = `\x1b[0m`;
const log = (...args) => {
    // const entryPoint =
    //   path.dirname(require.main!.filename) + `/`
    // const pathName = __filename
    //   .replace(entryPoint, ``)
    //   .replace(/\.(?:ts|js)$/g, ``)
    const pathName = /log\.[jt]s[^\n]*\n[^\n]*\/([^/]+\/[^/:]+)\.[^:]+/gi.exec(`${new Error().stack}`)?.[1];
    console.log(dim + `[` + pathName + `]` + reset, ...args);
};
exports.default = log;
//# sourceMappingURL=log.js.map