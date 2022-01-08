export declare class Profiler {
    enabled: boolean;
    showTop: number;
    cutoff: number;
    name: string | false;
    private snapshots;
    averages: {
        [key: string]: number;
    };
    readonly metric: any;
    constructor(top?: number, name?: string | false, enabled?: boolean, cutoff?: number);
    start(): void;
    private get currentSnapshot();
    private set currentSnapshot(value);
    step(name?: string): void;
    end(): void;
}
//# sourceMappingURL=Profiler.d.ts.map