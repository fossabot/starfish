"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on(`ship:buyItem`, (shipId, crewId, itemType, itemId, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        if (ship.captain !== crewMember.id)
            return callback({
                error: `Only the captain may buy or sell equipment.`,
            });
        const planet = ship.planet;
        if (!planet || planet.planetType !== `basic`)
            return callback({ error: `Not at a planet.` });
        const itemForSale = planet?.vendor?.items?.find((i) => i.type === itemType &&
            i.id === itemId &&
            i.buyMultiplier);
        if (!itemForSale || !itemForSale.buyMultiplier)
            return callback({
                error: `That equipment is not for sale here.`,
            });
        const price = dist_1.default.r2((dist_1.default.items[itemForSale.type][itemForSale.id]
            .basePrice || 1) *
            itemForSale.buyMultiplier *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1), 0, true);
        if (price > ship.commonCredits)
            return callback({ error: `Insufficient funds.` });
        if (ship.slots <= ship.items.length)
            return callback({
                error: `No slot available to attach any more equipment.`,
            });
        ship.commonCredits -= price;
        ship._stub = null;
        ship.toUpdate.commonCredits = ship.commonCredits;
        ship.addItem({ type: itemType, id: itemId });
        ship.logEntry([
            {
                text: dist_1.default.items[itemForSale.type][itemForSale.id].displayName,
                tooltipData: dist_1.default.items[itemForSale.type][itemForSale.id],
            },
            `bought by the captain for ${dist_1.default.r2(price)} credits.`,
        ], `high`);
        callback({
            data: dist_1.default.stubify(ship),
        });
        planet.addXp(price);
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought the ${itemType} of id ${itemId}.`);
    });
    socket.on(`ship:sellItem`, (shipId, crewId, itemType, itemId, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        if (ship.captain !== crewMember.id)
            return callback({
                error: `Only the captain may buy or sell equipment.`,
            });
        const planet = ship.planet;
        if (!planet || planet.planetType !== `basic`)
            return callback({ error: `Not at a planet.` });
        const heldItem = ship.items.find((i) => i.type === itemType && i.id === itemId);
        if (!heldItem)
            return callback({
                error: `Your ship doesn't have that item equipped.`,
            });
        const itemData = dist_1.default.items[itemType][itemId];
        if (!itemData)
            return callback({
                error: `No item found by that id.`,
            });
        const price = dist_1.default.r2((itemData?.basePrice || 1) *
            dist_1.default.baseItemSellMultiplier *
            planet.priceFluctuator *
            (planet.faction === ship.faction
                ? 1 + (1 - dist_1.default.factionVendorMultiplier || 1)
                : 1), 0, true);
        ship.commonCredits += price;
        ship._stub = null;
        ship.toUpdate.commonCredits = ship.commonCredits;
        ship.removeItem(heldItem);
        ship.logEntry([
            {
                text: heldItem.displayName,
                color: `var(--item)`,
                tooltipData: heldItem.toLogStub(),
            },
            `sold by the captain for ${dist_1.default.r2(price)} credits.`,
        ], `high`);
        callback({
            data: dist_1.default.stubify(ship),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} sold the ship's ${itemType} of id ${itemId}.`);
    });
    socket.on(`ship:swapChassis`, (shipId, crewId, chassisId, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        if (ship.captain !== crewMember.id)
            return callback({
                error: `Only the captain may buy or sell equipment.`,
            });
        const planet = ship.planet;
        if (!planet || planet.planetType !== `basic`)
            return callback({ error: `Not at a planet.` });
        const itemForSale = planet?.vendor?.chassis?.find((i) => i.id === chassisId);
        if (!itemForSale ||
            !itemForSale.buyMultiplier ||
            !dist_1.default.items.chassis[itemForSale.id])
            return callback({
                error: `That equipment is not for sale here.`,
            });
        const currentChassisSellPrice = Math.round(ship.chassis.basePrice * dist_1.default.baseItemSellMultiplier);
        const price = dist_1.default.r2((dist_1.default.items.chassis[itemForSale.id]?.basePrice || 1) *
            itemForSale.buyMultiplier *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1) -
            currentChassisSellPrice, 0, true);
        if (price > ship.commonCredits)
            return callback({ error: `Insufficient funds.` });
        if (ship.items.length >
            dist_1.default.items.chassis[itemForSale.id]?.slots)
            return callback({
                error: `Your equipment wouldn't all fit! Sell some equipment first, then swap chassis.`,
            });
        ship.commonCredits -= price;
        ship._stub = null;
        ship.toUpdate.commonCredits = ship.commonCredits;
        ship.swapChassis(dist_1.default.items.chassis[itemForSale.id]);
        ship.logEntry([
            {
                text: dist_1.default.items.chassis[itemForSale.id]
                    .displayName,
                tooltipData: dist_1.default.items.chassis[itemForSale.id],
            },
            `bought by the captain for ${dist_1.default.r2(price)} credits.`,
        ], `high`);
        callback({
            data: dist_1.default.stubify(ship),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} swapped to the chassis ${chassisId}.`);
    });
}
exports.default = default_1;
//# sourceMappingURL=items.js.map