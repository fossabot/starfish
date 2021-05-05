"use strict";
// const path = require(`path`)
Object.defineProperty(exports, "__esModule", { value: true });
const reset = `\x1b[0m`;
const colors = {
    dim: `\x1b[2m`,
    gray: `\x1b[2m`,
    bright: `\x1b[1m`,
    red: `\x1b[31m`,
    green: `\x1b[32m`,
    yellow: `\x1b[33m`,
    blue: `\x1b[34m`,
    magenta: `\x1b[35m`,
    pink: `\x1b[35m`,
    cyan: `\x1b[36m`,
    white: `\x1b[37m`,
    reset,
};
const log = (...args) => {
    const pathName = /log\.[jt]s[^\n]*\n[^\n]*\/([^/]+\/[^/]+\/[^/:]+)\.[^:]+/gi.exec(`${new Error().stack}`)?.[1];
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg in colors) {
            if (!args[index + 1])
                continue;
            if (typeof args[index + 1] === `object`) {
                // args[index] = colors[arg]
                // args = [
                //   ...args.slice(0, index + 2),
                //   reset,
                //   ...args.slice(index + 2),
                // ]
                args.splice(index, 1);
            }
            else {
                args[index + 1] =
                    colors[arg] + `${args[index + 1]}` + reset;
                args.splice(index, 1);
            }
        }
    }
    console.log(reset +
        colors.dim +
        `[${new Date().toLocaleTimeString(undefined, {
            hour12: false,
            hour: `2-digit`,
            minute: `2-digit`,
        })}][` +
        pathName +
        `]` +
        reset, ...args);
};
const error = (...args) => {
    log(`red`, ...args);
};
exports.default = { log, error };
//# sourceMappingURL=log.js.map