"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on(`god`, () => {
        socket.join([`game`]);
    });
    socket.on(`ship:basics`, (id, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = dist_1.default.stubify({
                name: foundShip.name,
                id: foundShip.id,
                faction: foundShip.faction,
                species: foundShip.species,
                tagline: foundShip.tagline,
                headerBackground: foundShip.headerBackground,
            });
            callback({ data: stub });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
    socket.on(`ship:listen`, (id, callback) => {
        // c.log(
        //   `gray`,
        //   `Frontend client started watching ship ${id} io`,
        // )
        socket.join([`ship:${id}`]);
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = dist_1.default.stubify(foundShip);
            callback({ data: stub });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
    socket.on(`ship:unlisten`, (id) => {
        dist_1.default.log(`gray`, `Frontend client stopped watching ${id} io`);
        socket.leave(`ship:${id}`);
    });
    socket.on(`ship:respawn`, (id, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (!foundShip) {
            callback({ error: `That ship doesn't exist yet!` });
            return;
        }
        if (!foundShip.dead) {
            callback({ error: `That ship isn't dead!` });
            return;
        }
        foundShip.respawn();
        const stub = dist_1.default.stubify(foundShip);
        callback({
            data: stub,
        });
    });
    socket.on(`ship:advanceTutorial`, (id) => {
        const ship = __1.game.ships.find((s) => s.id === id);
        if (!ship)
            return dist_1.default.log(`red`, `No ship found to advance tutorial for: ${id}`);
        if (!ship.tutorial)
            return dist_1.default.log(`red`, `Ship ${ship.name} (${ship.id}) is not in a tutorial, and thus cannot advance.`);
        // c.log(`gray`, `Advancing tutorial for ship ${id}`)
        ship.tutorial.advanceStep();
    });
    socket.on(`ship:headerBackground`, (shipId, crewId, bgId, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        if (ship.captain !== crewMember.id)
            return callback({
                error: `Only the captain may change the ship banner.`,
            });
        if (!ship.availableHeaderBackgrounds.includes(bgId))
            return callback({
                error: `You don't own that banner yet!`,
            });
        const found = dist_1.default.headerBackgroundOptions.find((b) => b.id === bgId);
        if (!found)
            return callback({
                error: `Invalid banner id.`,
            });
        ship.headerBackground = found.url;
        ship.toUpdate.headerBackground = found.url;
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} swapped banner to ${bgId}.`);
        callback({ data: `ok` });
    });
    socket.on(`ship:tagline`, (shipId, crewId, tagline, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        if (ship.captain !== crewMember.id)
            return callback({
                error: `Only the captain may change the ship tagline.`,
            });
        if (!tagline) {
            ship.tagline = null;
            ship.toUpdate.tagline = null;
            dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} cleared their tagline.`);
            callback({ data: `ok` });
            return;
        }
        if (!ship.availableTaglines.includes(tagline))
            return callback({
                error: `You don't own that tagline yet!`,
            });
        const found = dist_1.default.taglineOptions.find((t) => t === tagline);
        if (!found)
            return callback({
                error: `Invalid tagline.`,
            });
        ship.tagline = found;
        ship.toUpdate.tagline = found;
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} swapped tagline to ${tagline}.`);
        callback({ data: `ok` });
    });
}
exports.default = default_1;
//# sourceMappingURL=frontend.js.map