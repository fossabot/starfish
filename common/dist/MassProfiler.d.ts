export declare class MassProfiler {
    readonly metric: Performance | DateConstructor;
    enabled: boolean;
    trackedNames: {
        [key: string]: {
            [key: string]: {
                calls: number;
                totalTime: number;
                averageTotalTime: number;
                averageCalls: number;
            };
        };
    };
    printLength: number;
    private totalTime;
    private avgTotalTime;
    constructor(options?: {
        printLength?: number;
    });
    fullReset(): void;
    getTime(): number;
    call(categoryName: string, subCategoryName: string, time: number): void;
    print(): void;
    resetForNextTick(): void;
}
declare const massProfiler: MassProfiler;
export default massProfiler;
//# sourceMappingURL=massProfiler.d.ts.map