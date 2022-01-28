declare function trace(): void;
declare function error(...args: any[]): void;
declare function ignoreGrayLogs(): void;
declare const _default: {
    log: (...args: any[]) => void;
    trace: typeof trace;
    error: typeof error;
    ignoreGrayLogs: typeof ignoreGrayLogs;
};
export default _default;
//# sourceMappingURL=log.d.ts.map