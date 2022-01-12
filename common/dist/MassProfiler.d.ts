export default class MassProfiler {
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
    constructor();
    fullReset(): void;
    getTime(): number;
    call(className: string, functionName: string, time: number): void;
    print(): void;
    resetForNextTick(): void;
}
//# sourceMappingURL=MassProfiler.d.ts.map