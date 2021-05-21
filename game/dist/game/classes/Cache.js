"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor({ contents, location, message, time, id, }, game) {
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
    }
}
exports.Cache = Cache;
Cache.expireTime = 1000 * 60 * 60 * 24 * 7; // one week
//# sourceMappingURL=Cache.js.map