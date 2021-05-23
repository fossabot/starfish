declare function numberWithCommas(x: number): string;
declare function degreesToArrow(angle: number): string;
declare function coordPairToArrow(coordPair: CoordinatePair): string;
declare function percentToTextBars(percent?: number, barCount?: number): string;
declare function numberToEmoji(number?: number): string;
declare function emojiToNumber(emoji?: string): number;
declare function capitalize(string?: string): string;
declare function sanitize(string?: string): SanitizeResult;
declare function msToTimeString(ms?: number): string;
declare function garble(string?: string, percent?: number): string;
declare const _default: {
    maxNameLength: number;
    numberWithCommas: typeof numberWithCommas;
    degreesToArrow: typeof degreesToArrow;
    coordPairToArrow: typeof coordPairToArrow;
    percentToTextBars: typeof percentToTextBars;
    numberToEmoji: typeof numberToEmoji;
    emojiToNumber: typeof emojiToNumber;
    capitalize: typeof capitalize;
    sanitize: typeof sanitize;
    msToTimeString: typeof msToTimeString;
    garble: typeof garble;
};
export default _default;
//# sourceMappingURL=text.d.ts.map