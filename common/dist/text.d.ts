declare function numberWithCommas(x: number): string;
declare function printList(list: string[]): string;
declare function degreesToArrow(angle: number): string;
declare function coordPairToArrow(coordPair: CoordinatePair): string;
declare function numberToEmoji(number?: number): string;
declare function emojiToNumber(emoji?: string): number;
declare function capitalize(string?: string): string;
declare function sanitize(string?: string): SanitizeResult;
declare function camelCaseToWords(string?: string, capitalizeFirst?: boolean): string;
declare function msToTimeString(ms?: number): string;
declare function garble(string?: string, percent?: number): string;
declare const _default: {
    maxNameLength: number;
    numberWithCommas: typeof numberWithCommas;
    printList: typeof printList;
    degreesToArrow: typeof degreesToArrow;
    coordPairToArrow: typeof coordPairToArrow;
    numberToEmoji: typeof numberToEmoji;
    emojiToNumber: typeof emojiToNumber;
    capitalize: typeof capitalize;
    camelCaseToWords: typeof camelCaseToWords;
    sanitize: typeof sanitize;
    msToTimeString: typeof msToTimeString;
    garble: typeof garble;
};
export default _default;
//# sourceMappingURL=text.d.ts.map