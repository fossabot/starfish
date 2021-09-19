"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const maxNameLength = 16;
function numberWithCommas(x) {
    const decimal = x % 1;
    const total = Math.floor(x)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, `,`) +
        (decimal ? `${math_1.default.r2(decimal, 6)}`.substring(1) : ``);
    return total;
}
function printList(list) {
    if (!list)
        return ``;
    if (list.length === 1)
        return list[0];
    if (list.length === 2)
        return `${list[0]} and ${list[1]}`;
    return (list.slice(0, list.length - 1).join(`, `) +
        `, and ` +
        list[list.length - 1]);
}
const badwords_1 = require("./badwords");
const filter = new badwords_1.LanguageFilter();
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
    `🕚`,
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
// function percentToTextBars(
//   percent: number = 0,
//   barCount = 10,
// ): string {
//   const bars = []
//   for (let i = 0; i < 1; i += 1 / barCount)
//     bars.push(i < percent ? `▓` : `░`)
//   return `\`` + bars.join(``) + `\``
// }
function numberToEmoji(number = 0) {
    return numberEmojis[number] || `❓`;
}
function emojiToNumber(emoji = ``) {
    return numberEmojis.findIndex((e) => e === emoji);
}
const skipWords = [
    `a`,
    `an`,
    `the`,
    `of`,
    `in`,
    `to`,
    `per`,
];
function capitalize(string = ``) {
    return (string || ``)
        .split(` `)
        .map((s, index) => {
        if (skipWords.includes(s) && index > 0)
            return s;
        return (s.substring(0, 1).toUpperCase() +
            s.substring(1).toLowerCase());
    })
        .join(` `);
}
function sanitize(string = ``) {
    if (!string)
        string = ``;
    string = string.replace(/\n\r\t/g, ``).trim();
    const withoutURLs = string.replace(/(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_+.~#?&//=]*)/gi, ``);
    const cleaned = filter.clean(withoutURLs);
    return {
        ok: string === cleaned,
        result: cleaned,
        message: string === cleaned
            ? `ok`
            : `Sorry, you can't use language like that here.`,
    };
}
function camelCaseToWords(string = ``, capitalizeFirst) {
    let s = string.replace(/([A-Z])/g, ` $1`);
    if (capitalizeFirst)
        s = s.replace(/^./, (str) => str.toUpperCase());
    return s;
}
function msToTimeString(ms = 0) {
    let remainingSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(remainingSeconds / (60 * 60));
    remainingSeconds -= hours * 60 * 60;
    let minutes = Math.floor(remainingSeconds / 60);
    remainingSeconds -= minutes * 60;
    if (minutes < 10 && hours > 0)
        minutes = `0${minutes}`;
    let seconds = remainingSeconds;
    if (seconds < 10)
        seconds = `0${seconds}`;
    if (!hours)
        return `${minutes}m ${seconds}s`;
    if (!minutes || minutes === `00`)
        return `${seconds}s`;
    return `${hours}h ${minutes}m ${seconds}s`;
}
const possibleRandomCharacters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,$%&*-?!'🚀⚡️📣🙏💳🪐💪🌏🛸🌌🔧🎉🧭📍🔥🛠📦📡⏱😀☠️👍👎🖕👀 あいうえおるった月火水木金土`;
function garble(string = ``, percent = 0) {
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
    if (!Array.isArray(arr) || !arr.length)
        return;
    if (newIndex >= arr.length) {
        let k = newIndex - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
}
exports.default = {
    maxNameLength,
    numberWithCommas,
    printList,
    degreesToArrow,
    coordPairToArrow,
    // percentToTextBars,
    numberToEmoji,
    emojiToNumber,
    capitalize,
    camelCaseToWords,
    sanitize,
    msToTimeString,
    garble,
};
//# sourceMappingURL=text.js.map