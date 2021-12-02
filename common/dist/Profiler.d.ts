export var __esModule: boolean;
export class Profiler {
    constructor(top?: number, name?: boolean, enabled?: boolean, cutoff?: number);
    enabled: boolean;
    showTop: number;
    cutoff: number;
    name: boolean;
    snapshots: any[];
    metric: Performance | DateConstructor;
    set currentSnapshot(arg: any);
    get currentSnapshot(): any;
    step(name: any): void;
    end(): void;
}
//# sourceMappingURL=Profiler.d.ts.map