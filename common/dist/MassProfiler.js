"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    enabled = process.env.NODE_ENV !== `production`;
    metric;
    trackedNames = {};
    constructor() {
        this.metric = Date;
        try {
            this.metric = performance;
        }
        catch (e) {
            this.metric = Date;
        }
    }
    fullReset() {
        this.trackedNames = {};
    }
    getTime() {
        return this.metric.now();
    }
    call(className, functionName, time) {
        if (!this.trackedNames[className])
            this.trackedNames[className] = {};
        if (!this.trackedNames[className][functionName])
            this.trackedNames[className][functionName] = {
                calls: 0,
                totalTime: 0,
                averageTotalTime: 0,
                averageCalls: 0,
            };
        this.trackedNames[className][functionName].calls++;
        this.trackedNames[className][functionName].totalTime += time;
    }
    print() {
        if (!this.enabled)
            return;
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        const dateTime = `Profiler result: ${date} ${time}`;
        let output = `${dateTime}\n`;
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
            .slice(0, 10);
        for (const item of sortedByAvgTotalTime) {
            output += `${item.className}.${item.functionName}: 
  ${math_1.default.r2(item.averageTotalTime, 4)}ms cumulative avg/tick
  ${math_1.default.r2(item.averageCalls, 1)} calls avg/tick
  ${math_1.default.r2(item.averageTotalTime / item.averageCalls, 4)}ms avg/call\n`;
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
        log_1.default.log(output);
    }
    resetForNextTick() {
        for (const key in this.trackedNames) {
            for (const key2 in this.trackedNames[key]) {
                this.trackedNames[key][key2].averageTotalTime = math_1.default.lerp(this.trackedNames[key][key2].averageTotalTime || 0, this.trackedNames[key][key2].totalTime || 0, 0.1);
                this.trackedNames[key][key2].averageCalls = math_1.default.lerp(this.trackedNames[key][key2].averageCalls || 0, this.trackedNames[key][key2].calls || 0, 0.1);
                this.trackedNames[key][key2].calls = 0;
                this.trackedNames[key][key2].totalTime = 0;
            }
        }
    }
}
exports.default = MassProfiler;
//# sourceMappingURL=MassProfiler.js.map