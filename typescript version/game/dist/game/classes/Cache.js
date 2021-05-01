"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor({ contents, location, ownerId, message }, game) {
        this.message = ``;
        this.game = game;
        this.contents = contents;
        this.ownerId = ownerId;
        this.location = location;
        if (message)
            this.message = message;
    }
}
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map