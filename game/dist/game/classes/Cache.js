"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const Stubbable_1 = require("./Stubbable");
class Cache extends Stubbable_1.Stubbable {
    static rePickUpTime = 1000 * 60 * 5; // 5 minutes
    type = `cache`;
    id;
    contents;
    location;
    message = ``;
    time = Date.now();
    game;
    droppedBy;
    onlyVisibleToShipId;
    constructor({ contents, location, message, time, id, droppedBy, onlyVisibleToShipId, }, game) {
        super();
        this.game = game;
        this.contents = contents;
        this.location = location;
        if (message)
            this.message = message;
        if (time)
            this.time = time;
        this.id = id || `${Math.random()}`.substring(2);
        this.droppedBy = droppedBy;
        if (onlyVisibleToShipId)
            this.onlyVisibleToShipId = onlyVisibleToShipId;
    }
    canBePickedUpBy(ship) {
        if (this.onlyVisibleToShipId)
            return this.onlyVisibleToShipId === ship.id;
        const timeFromDrop = Date.now() - this.time;
        if (this.droppedBy === ship.id &&
            timeFromDrop < Cache.rePickUpTime)
            return false;
        return true;
    }
}
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map