"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const Filter = require(`bad-words`);
const filter = new Filter();
const numberEmojis = [
    `0️⃣`,
    `1️⃣`,
    `2️⃣`,
    `3️⃣`,
    `4️⃣`,
    `5️⃣`,
    `6️⃣`,
    `7️⃣`,
    `8️⃣`,
    `9️⃣`,
    `🔟`,
    `🕚`,
    `🕛`,
    `🕐`,
    `🕑`,
    `🕒`,
    `🕓`,
    `🕔`,
    `🕕`,
    `🕖`,
    `🕗`,
    `🕘`,
    `🕙`,
    `🕚`, // 23
];
const directionArrows = [
    `:arrow_right:`,
    `:arrow_upper_right:`,
    `:arrow_up:`,
    `:arrow_upper_left:`,
    `:arrow_left:`,
    `:arrow_lower_left:`,
    `:arrow_down:`,
    `:arrow_lower_right:`,
]; // ['→', '↗', '↑', '↖︎', '←', '↙', '↓', '↘︎']
function degreesToArrow(angle) {
    const normalizedAngle = ((angle + 45 / 2) % 360) / 360;
    const arrayIndex = Math.floor(normalizedAngle * directionArrows.length);
    return directionArrows[arrayIndex];
}
function coordPairToArrow(coordPair) {
    return degreesToArrow(math_1.default.vectorToDegrees(coordPair));
}
function percentToTextBars(percent, barCount = 10) {
    const bars = [];
    for (let i = 0; i < 1; i += 1 / barCount)
        bars.push(i < percent ? `▓` : `░`);
    return `\`` + bars.join(``) + `\``;
}
function numberToEmoji(number) {
    return numberEmojis[number] || `❓`;
}
function emojiToNumber(emoji) {
    return numberEmojis.findIndex((e) => e === emoji);
}
function capitalize(string) {
    return (string || ``)
        .split(` `)
        .map((s) => s.substring(0, 1).toUpperCase() +
        s.substring(1).toLowerCase())
        .join(` `);
}
function sanitize(string) {
    const cleaned = filter.clean(string);
    return {
        ok: string === cleaned,
        result: cleaned,
        message: string === cleaned
            ? `ok`
            : `Sorry, you can't use language like that here.`,
    };
}
function msToTimeString(ms) {
    let seconds = `${Math.round((ms % (60 * 1000)) / 1000)}`;
    if (seconds <= `9`)
        seconds = `0` + seconds;
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds}`;
}
const possibleRandomCharacters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,$%&*-?!'🚀⚡️📣🙏💳🪐💪🌏🛸🌌🔧🎉🧭📍🔥🛠📦📡⏱😀☠️👍👎🖕👀 `;
function garble(string, percent = 0) {
    if (percent > 0.98)
        percent = 0.98;
    let splitString = string.split(` `);
    // move words around
    while (Math.random() < percent) {
        arrayMove(splitString, Math.floor(splitString.length * Math.random()), Math.floor(splitString.length * Math.random()));
    }
    if (percent > 0.1) {
        // move letters around
        splitString = splitString.map((word) => {
            let characters = word.split(``);
            while (Math.random() < percent * 0.7) {
                arrayMove(characters, Math.floor(characters.length * Math.random()), Math.floor(characters.length * Math.random()));
            }
            if (percent > 0.3) {
                // randomize letters
                characters = characters.map((char) => {
                    if (Math.random() < percent * 0.5) {
                        char = possibleRandomCharacters.charAt(Math.floor(Math.random() *
                            possibleRandomCharacters.length));
                    }
                    return char;
                });
            }
            return characters.join(``);
        });
    }
    return splitString.join(` `);
}
function arrayMove(arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
        let k = newIndex - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
}
exports.default = {
    degreesToArrow,
    coordPairToArrow,
    percentToTextBars,
    numberToEmoji,
    emojiToNumber,
    capitalize,
    sanitize,
    msToTimeString,
    garble,
};
//# sourceMappingURL=text.js.map