export declare class Profiler {
    enabled: boolean;
    showTop: number;
    name: string | false;
    private snapshots;
    constructor(top?: number, name?: string | false, enabled?: boolean);
    private get currentSnapshot();
    private set currentSnapshot(value);
    start(name?: string): void;
    step(name?: string): void;
    end(): void;
}
//# sourceMappingURL=Profiler.d.ts.map