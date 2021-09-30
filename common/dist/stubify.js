"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __importDefault(require("./log"));
const Profiler_1 = require("./Profiler");
const neverInclude = [`toUpdate`, `_stub`, `_id`, `game`];
const alwaysReferencize = [
    `ship`,
    `targetShip`,
    `ships`,
    `attacker`,
    `defender`,
    `crewMember`,
    `homeworld`,
    `faction`,
    `species`,
];
function stubify(baseObject, keysToReferencize = [], allowRecursionDepth = 8) {
    if (!baseObject)
        return undefined;
    const profiler = new Profiler_1.Profiler(10, `stubify`, false, 0);
    profiler.step(`apply getters`);
    const objectWithGetters = applyGettersToObject(baseObject, keysToReferencize);
    profiler.step(`stringify and parse`);
    // c.log(`with getters`, Object.keys(gettersIncluded))
    const objectWithCircularReferencesRemoved = removeCircularReferences(objectWithGetters, keysToReferencize, allowRecursionDepth);
    profiler.end();
    return objectWithCircularReferencesRemoved;
}
exports.default = stubify;
// * getters aren't naturally included in functions like Object.keys(), so we apply their result now
function applyGettersToObject(baseObject, keysToReferencize = []) {
    const toReference = [
        ...alwaysReferencize,
        ...keysToReferencize,
    ];
    const gettersIncluded = { ...baseObject };
    const objectPrototype = Object.getPrototypeOf(baseObject);
    const getKeyValue = (key) => (obj) => obj[key];
    // c.log(Object.getOwnPropertyNames(objectPrototype))
    for (const key of Object.getOwnPropertyNames(objectPrototype)) {
        if (toReference.includes(key) ||
            neverInclude.includes(key))
            continue;
        const descriptor = Object.getOwnPropertyDescriptor(objectPrototype, key);
        const hasGetter = descriptor && typeof descriptor.get === `function`;
        if (hasGetter)
            gettersIncluded[key] = getKeyValue(key)(baseObject);
    }
    return gettersIncluded;
}
const doNotSetFlag = `%%[do not set]%%`;
const recursivelyRemoveCircularReferencesInObject = (obj, disallowedKeys, remainingDepth, passedKey, track) => {
    let newObj = {};
    if (remainingDepth <= 0) {
        if (track)
            log_1.default.log(`reached depth limit`, obj, toRefOrUndefined(obj));
        return toRefOrUndefined(obj);
    }
    // array
    if (Array.isArray(obj)) {
        newObj = obj
            .map((v) => recursivelyRemoveCircularReferencesInObject(v, disallowedKeys, remainingDepth - 1, passedKey, track))
            .filter((v) => v !== doNotSetFlag);
    }
    // string
    else if (typeof obj === `string` || obj instanceof String)
        newObj = obj;
    // object
    else if (obj && typeof obj === `object`) {
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            // null/undefined
            if (value === null || value === undefined) {
                newObj[key] = undefined;
            }
            // never include key => marker to not set value
            else if (neverInclude.includes(key))
                newObj[key] = doNotSetFlag;
            // disallowed key => stub
            else if (disallowedKeys.includes(key) &&
                typeof value === `object` &&
                !Array.isArray(value)) {
                newObj[key] = toRefOrUndefined(value);
            }
            // nested object
            else if (typeof value === `object`) {
                const res = recursivelyRemoveCircularReferencesInObject(value, disallowedKeys, remainingDepth - 1, key, track);
                if (res !== doNotSetFlag)
                    newObj[key] = res;
            }
            // anything else
            else {
                newObj[key] = value;
            }
            // clear anything that came back as a DNS flag
            if (newObj[key] === doNotSetFlag)
                delete newObj[key];
        }
    }
    // fallback
    else
        newObj = obj;
    if (track)
        log_1.default.log(`tracked`, passedKey, obj, newObj);
    log_1.default.log(passedKey);
    return newObj;
};
function removeCircularReferences(baseObject, keysToReferencize = [], allowRecursionDepth) {
    const toReference = [
        ...alwaysReferencize,
        ...keysToReferencize,
    ];
    return recursivelyRemoveCircularReferencesInObject(baseObject, toReference, allowRecursionDepth);
}
const toRefOrUndefined = (obj) => {
    if (!obj)
        return null;
    if (typeof obj === `string` || obj instanceof String)
        return obj;
    if (typeof obj !== `object`)
        return obj;
    const returnObj = {};
    if (obj.id)
        returnObj.id = obj.id;
    if (obj.name)
        returnObj.name = obj.name;
    if (obj.type)
        returnObj.type = obj.type;
    if (Object.keys(returnObj).length === 0)
        return undefined;
    return returnObj;
};
// try {
//   circularReferencesRemoved = JSON.parse(
//     JSON.stringify(
//       gettersIncluded,
//       (key: string, value: any) => {
//         if ([`toUpdate`, `_stub`, `_id`].includes(key))
//           return undefined
//         // if (baseObject.ai === false)
//         //   c.log(`key`, key, value)
//         if (
//           [
//             `game`,
//             `ship`,
//             `ships`,
//             `attacker`,
//             `defender`,
//             `crewMember`,
//             `homeworld`,
//             `faction`,
//             `species`,
//           ].includes(key)
//         )
//           return Array.isArray(value)
//             ? value.map((v) =>
//                 v.id ? { id: v.id } : null,
//               )
//             : value?.id
//             ? { id: value.id }
//             : null
//         if (keysToReferencize?.includes(key))
//           return value?.id ? { id: value.id } : null
//         if (
//           value &&
//           typeof value === `object` &&
//           !Array.isArray(value)
//         ) {
//           // if (allowRecursionDepth)
//           //   return stubify(
//           //     value,
//           //     keysToReferencize,
//           //     allowRecursionDepth,
//           //   )
//           return value?.id
//             ? { id: value.id }
//             : value?.name
//             ? { name: value.name }
//             : null
//         }
//         // if (
//         //   [`ships`].includes(key) &&
//         //   Array.isArray(value)
//         // )
//         //   if (allowRecursionDepth)
//         //     return value.map((v) =>
//         //       stubify(
//         //         v,
//         //         [
//         //           `visible`,
//         //           `seenPlanets`,
//         //           `seenLandmarks`,
//         //           `enemiesInAttackRange`,
//         //         ],
//         //         allowRecursionDepth,
//         //       ),
//         //     )
//         //   else
//         //     return value.map((v) =>
//         //       v?.id
//         //         ? { id: v.id }
//         //         : v?.name
//         //         ? { name: v.name }
//         //         : null,
//         //     )
//         return value
//       },
//     ),
//   ) as StubType
// } catch (e) {
//   c.log(`red`, `Failed to stubify`, baseObject, e)
//   c.trace()
// }
// circularReferencesRemoved.lastUpdated = Date.now()
//# sourceMappingURL=stubify.js.map