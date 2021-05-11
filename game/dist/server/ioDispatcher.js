"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const io_1 = require("./io");
__1.game.onAny((eventNameOrArray, payload) => {
    const eventName = (Array.isArray(eventNameOrArray)
        ? eventNameOrArray[0]
        : eventNameOrArray);
    const deconstructed = /([^:]+)[:$](?:([^:]+)[:$])?(?:([^:]+)[:$])?/.exec(eventName);
    if (!deconstructed)
        return;
    let [unused, domain, type, specifier] = deconstructed;
    if (!specifier)
        specifier = type;
    if (domain === 'game') {
        io_1.io.to(`game`).emit(eventName);
    }
    if (domain === 'ship') {
        if (!('shipId' in payload))
            return;
        io_1.io.to(`ship.${payload.shipId}`).emit(eventName);
    }
});
//# sourceMappingURL=ioDispatcher.js.map