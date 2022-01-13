export declare class MassProfiler {
    readonly enabled: boolean;
    readonly metric: Performance | DateConstructor;
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
//# sourceMappingURL=MassProfiler.d.ts.map