"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profiler = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class Profiler {
    constructor(top = 10, name = false, enabled = true) {
        this.enabled = true;
        this.showTop = 10;
        this.snapshots = [];
        this.enabled = enabled;
        this.showTop = top;
        this.name = name;
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
    start(name) {
        if (!this.enabled)
            return;
        this.currentSnapshot = {
            name: name || `0`,
            time: Date.now(),
            timeFromStart: 0,
        };
    }
    step(name) {
        if (!this.enabled)
            return;
        const time = Date.now();
        if (this.currentSnapshot)
            this.currentSnapshot.duration =
                time -
                    this.snapshots[this.snapshots.length - 1].time;
        this.currentSnapshot = {
            name: name || `${this.snapshots.length}`,
            time,
            timeFromStart: time - this.snapshots[0].time,
        };
    }
    end() {
        if (!this.enabled)
            return;
        const time = Date.now();
        if (this.currentSnapshot)
            this.currentSnapshot.duration =
                time -
                    this.snapshots[this.snapshots.length - 1].time;
        dist_1.default.log(`----- ${this.name ? String(this.name) : `profiler start`} -----`);
        this.snapshots
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, this.showTop)
            .forEach((ss) => dist_1.default.log(`${this.name ? this.name + `/` : ``}${ss.name}: ${ss.duration}ms`));
        this.snapshots = [];
    }
}
exports.Profiler = Profiler;
//# sourceMappingURL=Profiler.js.map