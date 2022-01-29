"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MassProfiler = void 0;
const log_1 = __importDefault(require("./log"));
const math_1 = __importDefault(require("./math"));
// register sections
// register subsections indefinitely
// way to view: top sections, top subsections
// report out to json?
// get total per function per tick
// count total number of calls
// sort by total time spent and time spent per call
class MassProfiler {
    metric;
    enabled = process.env.NODE_ENV !== `production`;
    trackedNames = {};
    printLength = 20;
    totalTime = 0;
    avgTotalTime = 0;
    constructor(options = {}) {
        if (options.printLength)
            this.printLength = options.printLength;
        this.metric = Date;
        try {
            this.metric = performance;
        }
        catch (e) {
            this.metric = Date;
        }
    }
    fullReset() {
        if (!this.enabled)
            return;
        this.trackedNames = {};
        this.totalTime = 0;
        this.avgTotalTime = 0;
    }
    getTime() {
        if (!this.enabled)
            return 0;
        return this.metric.now();
    }
    call(categoryName, subCategoryName, time) {
        if (!this.enabled)
            return;
        if (!this.trackedNames[categoryName])
            this.trackedNames[categoryName] = {};
        if (!this.trackedNames[categoryName][subCategoryName])
            this.trackedNames[categoryName][subCategoryName] = {
                calls: 0,
                totalTime: 0,
                averageTotalTime: 0,
                averageCalls: 0,
            };
        this.trackedNames[categoryName][subCategoryName].calls++;
        this.trackedNames[categoryName][subCategoryName].totalTime += time;
        this.totalTime += time;
    }
    print(count = this.printLength) {
        if (!this.enabled)
            return;
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        const dateTime = `Profiler result: ${date} ${time}`;
        let output = [`${dateTime}\n`];
        let sortedByAvgTotalTime = [];
        for (const key in this.trackedNames) {
            for (const key2 in this.trackedNames[key]) {
                sortedByAvgTotalTime.push({
                    className: key,
                    functionName: key2,
                    ...this.trackedNames[key][key2],
                });
            }
        }
        sortedByAvgTotalTime = sortedByAvgTotalTime
            .filter((item) => item.averageTotalTime > 0.0001)
            .sort((a, b) => {
            return b.averageTotalTime - a.averageTotalTime;
        })
            .slice(0, count);
        for (const item of sortedByAvgTotalTime) {
            output.push(`${item.className}.${item.functionName}\n  `);
            output.push(`gray`, `${math_1.default.r2(item.averageTotalTime, 4)}ms total/tick`.padEnd(35));
            output.push(`gray`, `${math_1.default.r2(item.averageCalls, 1)} calls/tick`.padEnd(25));
            output.push(`gray`, `${math_1.default.r2(item.averageTotalTime / item.averageCalls, 4)}ms/call`);
            output.push(`\n`);
        }
        // for (const key in this.trackedNames) {
        //   output += `  ${key}\n`
        //   for (const key2 of Object.keys(this.trackedNames[key]).sort((a, b) => {
        //     return (
        //       this.trackedNames[key][b].averageTotalTime -
        //       this.trackedNames[key][a].averageTotalTime
        //     )
        //   })) {
        //     const { calls, totalTime, averageTotalTime, averageCalls } =
        //       this.trackedNames[key][key2]
        //     output += `    ${key2}: ${calls} calls, ${math.r2(
        //       totalTime,
        //     )}ms total, ${
        //       calls ? math.r2(totalTime / calls, 4) : 0
        //     }ms avg, ${math.r2(averageTotalTime)}ms avg total, ${math.r2(
        //       averageCalls,
        //     )} avg calls/tick\n`
        //   }
        // }
        log_1.default.log(...output);
        return output.join(``);
    }
    resetForNextTick() {
        if (!this.enabled)
            return;
        for (const key in this.trackedNames) {
            for (const key2 in this.trackedNames[key]) {
                this.trackedNames[key][key2].averageTotalTime =
                    this.trackedNames[key][key2].averageTotalTime === 0
                        ? this.trackedNames[key][key2].totalTime
                        : math_1.default.lerp(this.trackedNames[key][key2].averageTotalTime || 0, this.trackedNames[key][key2].totalTime || 0, 0.1);
                this.trackedNames[key][key2].averageCalls =
                    this.trackedNames[key][key2].averageCalls === 0
                        ? this.trackedNames[key][key2].calls
                        : math_1.default.lerp(this.trackedNames[key][key2].averageCalls || 0, this.trackedNames[key][key2].calls || 0, 0.1);
                this.trackedNames[key][key2].calls = 0;
                this.trackedNames[key][key2].totalTime = 0;
            }
        }
        this.avgTotalTime =
            this.avgTotalTime === 0
                ? this.totalTime
                : math_1.default.lerp(this.avgTotalTime, this.totalTime, 0.1);
        this.totalTime = 0;
    }
}
exports.MassProfiler = MassProfiler;
const massProfiler = new MassProfiler();
exports.default = massProfiler;
//# sourceMappingURL=massProfiler.js.map