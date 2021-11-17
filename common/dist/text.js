"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
const maxNameLength = 16;
function numberWithCommas(x) {
    let negative = false;
    if (x < 0) {
        negative = true;
        x = -x;
    }
    if (x < 1000)
        return x;
    const decimal = x % 1;
    const total = Math.floor(x)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, `,`) +
        (decimal ? `${math_1.default.r2(decimal, 6)}`.substring(1) : ``);
    return (negative ? `-` : ``) + total;
}
function speedNumber(numberInAu, noTag = false, maxDecimalPlaces = 2) {
    const isNegative = numberInAu < 0;
    if (isNegative)
        numberInAu = -numberInAu;
    let output = ``;
    const numberInKm = numberInAu * globals_1.default.kmPerAu;
    if (numberInKm < 1000)
        output = `${math_1.default.r2(numberInKm, 0)}`;
    else if (numberInKm < 1000000)
        output = `${math_1.default.r2(numberInKm / 1000, 0)}k`;
    else if (numberInKm < 1000000000)
        output = `${math_1.default.r2(numberInKm / 1000000, Math.min(Math.max(maxDecimalPlaces, numberInKm / 1000000 / 10 < 1
            ? maxDecimalPlaces + 1
            : maxDecimalPlaces), 2))}M`;
    else
        output = `${math_1.default.r2(numberInKm / 1000000000, Math.min(Math.max(maxDecimalPlaces, numberInKm / 1000000000 / 10 < 1
            ? maxDecimalPlaces + 1
            : maxDecimalPlaces), 2))}B`;
    return ((isNegative ? `-` : ``) +
        output +
        (noTag ? `` : ` km/hr`));
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
];
const directionArrowEmoji = [
    `→`,
    `↗`,
    `↑`,
    `↖︎`,
    `←`,
    `↙`,
    `↓`,
    `↘︎`,
];
function degreesToArrow(angle) {
    const normalizedAngle = ((angle + 45 / 2) % 360) / 360;
    const arrayIndex = Math.floor(normalizedAngle * directionArrows.length);
    return directionArrows[arrayIndex];
}
function degreesToArrowEmoji(angle) {
    const normalizedAngle = ((angle + 45 / 2) % 360) / 360;
    const arrayIndex = Math.floor(normalizedAngle * directionArrows.length);
    return directionArrowEmoji[arrayIndex];
}
function coordPairToArrow(coordPair) {
    return degreesToArrow(math_1.default.vectorToDegrees(coordPair));
}
function percentToTextBars(percent = 0, barCount = 10) {
    const bars = [];
    const barGap = 1 / barCount;
    for (let i = 0; i < 1; i += 1 / barCount) {
        bars.push(Math.max(i - barGap / 2, 0) < percent ? `■` : `□`);
    }
    return `\`` + bars.join(``) + `\``;
}
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
        .toLowerCase()
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
    string = string.replace(/\n\r\t`/g, ``).trim();
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
    if (typeof string !== `string`)
        string = `${string}`;
    let s = string.replace(/([A-Z])/g, ` $1`);
    if (capitalizeFirst)
        s = s.replace(/^./, (str) => str.toUpperCase());
    return s;
}
function acronym(string = ``) {
    return string
        .replace(/[^a-z A-Z]/g, ``)
        .split(` `)
        .map((s) => {
        if (skipWords.includes(s.toLowerCase()))
            return ``;
        return s.substring(0, 1);
    })
        .filter((w) => w)
        .join(``)
        .toUpperCase();
}
function msToTimeString(ms = 0, short = false) {
    const negativePrefix = ms < 0 ? `-` : ``;
    if (negativePrefix)
        ms *= -1;
    let remainingSeconds = Math.floor(ms / 1000);
    let years = Math.floor(remainingSeconds / (60 * 60 * 24 * 365));
    remainingSeconds -= years * 60 * 60 * 24 * 365;
    let days = Math.floor(remainingSeconds / (60 * 60 * 24));
    remainingSeconds -= days * 60 * 60 * 24;
    let hours = Math.floor(remainingSeconds / (60 * 60));
    remainingSeconds -= hours * 60 * 60;
    let minutes = Math.floor(remainingSeconds / 60);
    remainingSeconds -= minutes * 60;
    if (minutes < 10 && hours > 0)
        minutes = `0${minutes}`;
    let seconds = remainingSeconds;
    if (seconds < 10 && minutes > 0)
        seconds = `0${seconds}`;
    if (!years && !days && !hours && !minutes)
        return `${negativePrefix}${seconds}s`;
    if (!years && !days && !hours)
        return `${negativePrefix}${minutes}m ${!short && seconds ? `${seconds}s` : ``}`;
    if (!years && !days)
        return `${negativePrefix}${hours}h  ${!short && minutes ? `${minutes}m` : ``}`;
    if (!years)
        return `${negativePrefix}${days}d ${!short && hours ? `${hours}h` : ``}`;
    return `${negativePrefix}${years}y ${!short && days ? `${days}d` : ``}`;
}
const possibleRandomCharacters = `ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz1234567890.,$%&*-?!'🚀⚡️📣🙏💳🪐💪🌏🛸🌌🔧🎉🧭📍🔥🛠📦📡⏱😀☠️👍👎🖕👀 あいうえおるった月火水木金土월화수목금토일`;
function garble(string = ``, percent = 0) {
    if (percent > 0.98)
        percent = 0.98;
    let splitString = string.split(` `);
    // move words around
    while (Math.random() < percent * 0.8) {
        arrayMove(splitString, Math.floor(splitString.length * Math.random()), Math.floor(splitString.length * Math.random()));
    }
    if (percent > 0.1) {
        // move letters around
        splitString = splitString.map((word) => {
            let characters = word.split(``);
            while (Math.random() < percent * 0.6) {
                arrayMove(characters, Math.floor(characters.length * Math.random()), Math.floor(characters.length * Math.random()));
            }
            if (percent > 0.3) {
                // randomize letters
                characters = characters.map((char) => {
                    if (Math.random() < percent * 0.4) {
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
function priceToString(p) {
    let s = ``;
    if (p.credits)
        s += `💳${numberWithCommas(math_1.default.r2(p.credits))} `;
    if (p.crewCosmeticCurrency)
        s += `🟡${numberWithCommas(math_1.default.r2(p.crewCosmeticCurrency))} `;
    if (p.shipCosmeticCurrency)
        s += `💎${numberWithCommas(math_1.default.r2(p.shipCosmeticCurrency))} `;
    if (!s)
        s = `Free`;
    return s.trim();
}
exports.default = {
    maxNameLength,
    numberWithCommas,
    speedNumber,
    printList,
    degreesToArrow,
    degreesToArrowEmoji,
    coordPairToArrow,
    percentToTextBars,
    numberToEmoji,
    emojiToNumber,
    capitalize,
    camelCaseToWords,
    sanitize,
    msToTimeString,
    garble,
    acronym,
    priceToString,
};
//# sourceMappingURL=text.js.map