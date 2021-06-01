"use strict";
// const path = require(`path`)
Object.defineProperty(exports, "__esModule", { value: true });
const fillCharacter = `.`;
let longest = 0;
const reset = `\x1b[0m`, dim = `\x1b[2m`, bright = `\x1b[1m`;
const colors = {
    gray: `\x1b[2m`,
    red: `\x1b[31m`,
    green: `\x1b[32m`,
    yellow: `\x1b[33m`,
    blue: `\x1b[34m`,
    pink: `\x1b[35m`,
    cyan: `\x1b[36m`,
    white: `\x1b[37m`,
};
const dirColors = {
    red: `\x1b[31m`,
    green: `\x1b[32m`,
    yellow: `\x1b[33m`,
    blue: `\x1b[34m`,
    pink: `\x1b[35m`,
    cyan: `\x1b[36m`,
};
const mainDirs = [
// 'common', 'discord', 'frontend', 'game'
];
const log = (...args) => {
    const regexResult = /log\.[jt]s[^\n]*\n([^\n]*\/([^/]+\/[^/]+\/[^/:]+))\.[^:]+/gi.exec(`${new Error().stack}`);
    const fullPath = regexResult?.[1] || ``;
    const mainDir = mainDirs.find((d) => fullPath.indexOf(`/${d}/`) !== -1);
    const pathName = regexResult?.[2]?.replace(/(dist\/|src\/)/gi, ``) || ``;
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
    let mainDirColor = !mainDir
        ? ``
        : Object.values(dirColors)[mainDir
            .split(``)
            .map((c) => c.charCodeAt(0))
            .reduce((total, curr) => curr + total, 0) %
            Object.values(dirColors).length];
    let prefix = String(reset +
        dim +
        `[${new Date().toLocaleTimeString(undefined, {
            hour12: false,
            hour: `2-digit`,
            minute: `2-digit`,
        })}]` +
        (mainDir
            ? reset +
                mainDirColor +
                mainDir +
                colors.white +
                dim +
                `:`
            : ``) +
        pathName);
    if (prefix.length > longest)
        longest = prefix.length;
    prefix = prefix.padEnd(longest, fillCharacter) + reset;
    console.log(prefix, ...args);
};
function trace() {
    console.trace();
}
exports.default = { log, trace };
//# sourceMappingURL=log.js.map