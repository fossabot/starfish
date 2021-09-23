"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __importDefault(require("./log"));
const Profiler_1 = require("./Profiler");
function stubify(baseObject, disallowPropNames = [], allowRecursionDepth = 3) {
    allowRecursionDepth--;
    if (!baseObject)
        return undefined;
    const profiler = new Profiler_1.Profiler(10, `stubify`, false, 0);
    profiler.step(`getters`);
    const gettersIncluded = { ...baseObject };
    const proto = Object.getPrototypeOf(baseObject);
    const getKeyValue = (key) => (obj) => obj[key];
    // c.log(Object.getOwnPropertyNames(proto))
    for (const key of Object.getOwnPropertyNames(proto)) {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        const hasGetter = desc && typeof desc.get === `function`;
        if (hasGetter) {
            gettersIncluded[key] = getKeyValue(key)(baseObject);
        }
    }
    profiler.step(`stringify and parse`);
    // c.log(Object.keys(gettersIncluded))
    let circularReferencesRemoved;
    try {
        circularReferencesRemoved = JSON.parse(JSON.stringify(gettersIncluded, (key, value) => {
            if ([`toUpdate`, `_stub`, `_id`].includes(key))
                return undefined;
            if ([
                `game`,
                `ship`,
                `attacker`,
                `defender`,
                `crewMember`,
                `homeworld`,
                `faction`,
                `species`,
            ].includes(key))
                return value?.id ? { id: value.id } : null;
            if (disallowPropNames?.includes(key))
                return value?.id ? { id: value.id } : null;
            // ! this was breaking saving any array of stubbable objects
            // if (
            //   Array.isArray(value) &&
            //   value.length > 0 &&
            //   value.reduce(
            //     (allStubbable, v) =>
            //       v && allStubbable && Boolean(v.stubify),
            //     true,
            //   )
            // ) {
            //   if (baseObject.ai === false && key === `items`)
            //     c.log(
            //       baseObject.name,
            //       allowRecursionDepth,
            //       value.map(
            //         (v) =>
            //           v.stubify(
            //             disallowPropNames,
            //             allowRecursionDepth,
            //           ).type,
            //       ),
            //     )
            //   if (allowRecursionDepth)
            //     return value.map((v) =>
            //       v.stubify(
            //         disallowPropNames,
            //         allowRecursionDepth,
            //       ),
            //     )
            //   return value.map((v) =>
            //     v?.id
            //       ? { id: v.id }
            //       : v?.name
            //       ? { name: v.name }
            //       : null,
            //   )
            // }
            if (value &&
                typeof value === `object` &&
                !Array.isArray(value) &&
                value.stubify) {
                if (allowRecursionDepth)
                    return value.stubify(disallowPropNames, allowRecursionDepth);
                return value?.id
                    ? { id: value.id }
                    : value?.name
                        ? { name: value.name }
                        : null;
            }
            if ([`ships`].includes(key) &&
                Array.isArray(value))
                if (allowRecursionDepth)
                    return value.map((v) => v?.stubify?.([
                        `visible`,
                        `seenPlanets`,
                        `seenLandmarks`,
                        `enemiesInAttackRange`,
                    ], allowRecursionDepth));
                else
                    return value.map((v) => v?.id
                        ? { id: v.id }
                        : v?.name
                            ? { name: v.name }
                            : null);
            return value;
        }));
    }
    catch (e) {
        log_1.default.log(`red`, `Failed to stubify`, baseObject, e);
        log_1.default.trace();
    }
    // circularReferencesRemoved.lastUpdated = Date.now()
    profiler.end();
    return circularReferencesRemoved;
}
exports.default = stubify;
//# sourceMappingURL=stubify.js.map