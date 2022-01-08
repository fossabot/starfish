"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profiler = void 0;
const log_1 = __importDefault(require("./log"));
const math_1 = __importDefault(require("./math"));
class Profiler {
    enabled = true;
    showTop = 10;
    cutoff = 1;
    name;
    snapshots = [];
    averages = {};
    metric;
    constructor(top = 10, name = false, enabled = true, cutoff = 2) {
        this.enabled = enabled;
        this.showTop = top;
        this.name = name;
        this.cutoff = cutoff;
        if (!this.enabled)
            return;
        this.metric = Date;
        try {
            this.metric = performance;
        }
        catch (e) {
            this.metric = Date;
        }
        this.currentSnapshot = {
            name: `start`,
            time: this.metric.now(),
            timeFromStart: 0,
        };
    }
    start() {
        if (!this.enabled)
            return;
        this.currentSnapshot = {
            name: `start`,
            time: this.metric.now(),
            timeFromStart: 0,
        };
    }
    get currentSnapshot() {
        if (!this.snapshots.length)
            return null;
        return this.snapshots[this.snapshots.length - 1];
    }
    set currentSnapshot(ss) {
        if (ss)
            this.snapshots.push(ss);
    }
    step(name) {
        if (!this.enabled)
            return;
        const time = this.metric.now();
        if (this.currentSnapshot) {
            this.currentSnapshot.duration =
                time - this.snapshots[this.snapshots.length - 1].time;
            if (!this.averages[this.currentSnapshot.name]) {
                this.averages[this.currentSnapshot.name] = this.currentSnapshot.duration;
            }
            else {
                this.averages[this.currentSnapshot.name] = math_1.default.lerp(this.averages[this.currentSnapshot.name] || 0, this.currentSnapshot.duration, 0.1);
            }
        }
        name = name || `${this.snapshots.length}`;
        this.currentSnapshot = {
            name,
            time,
            timeFromStart: time - this.snapshots[0].time,
        };
    }
    end() {
        if (!this.enabled)
            return;
        const time = this.metric.now();
        if (this.currentSnapshot)
            this.currentSnapshot.duration =
                time - this.snapshots[this.snapshots.length - 1].time;
        const toPrint = this.snapshots
            .filter((s) => s.duration && s.duration >= this.cutoff)
            .sort((a, b) => (this.averages[b.name] || 0) - (this.averages[a.name] || 0))
            .slice(0, this.showTop);
        if (!toPrint.length)
            return;
        log_1.default.log(`----- ${this.name ? String(this.name) : `profiler start`} -----`);
        toPrint.forEach((s) => log_1.default.log(`${s.name}: ${math_1.default.r2(this.averages[s.name] || 0)}ms`));
        this.snapshots = [];
    }
}
exports.Profiler = Profiler;
//# sourceMappingURL=Profiler.js.map