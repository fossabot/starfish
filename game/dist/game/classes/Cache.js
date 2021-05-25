"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor({ contents, location, message, time, id, droppedBy, }, game) {
        this.message = ``;
        this.time = Date.now();
        this.game = game;
        this.contents = contents;
        this.location = location;
        if (message)
            this.message = message;
        if (time)
            this.time = time;
        this.id = id || `${Math.random()}`.substring(2);
        this.droppedBy = droppedBy;
    }
    canBePickedUpBy(ship) {
        const timeFromDrop = Date.now() - this.time;
        if (this.droppedBy === ship.id &&
            timeFromDrop < Cache.rePickUpTime)
            return false;
        return true;
    }
}
exports.Cache = Cache;
Cache.rePickUpTime = 1000 * 60; // 1 minute
Cache.expireTime = 1000 * 60 * 60 * 24 * 7; // one week
//# sourceMappingURL=Cache.js.map