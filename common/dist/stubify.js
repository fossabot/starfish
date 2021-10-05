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
    `guild`,
    `species`,
];
function stubify(baseObject, keysToReferencize = [], allowRecursionDepth = 8) {
    if (!baseObject)
        return undefined;
    const profiler = new Profiler_1.Profiler(10, `stubify`, false, 0);
    profiler.step(`apply getters`);
    let objectWithGetters;
    if (!Array.isArray(baseObject) &&
        typeof baseObject === `object` &&
        !(baseObject instanceof String))
        objectWithGetters = applyGettersToObject(baseObject, keysToReferencize);
    else
        objectWithGetters = baseObject;
    // c.log(`with getters`, Object.keys(gettersIncluded))
    profiler.step(`stringify and parse`);
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
    // undefined
    if (obj === undefined)
        return doNotSetFlag;
    // null
    if (obj === null)
        return null;
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
    else if (obj !== undefined && typeof obj === `object`) {
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
    if (obj.toReference)
        return obj.toReference();
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
//# sourceMappingURL=stubify.js.map