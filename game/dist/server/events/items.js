"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
const allItemData = __importStar(require("../../game/presets/items"));
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
        if (!planet)
            return callback({ error: `Not at a planet.` });
        const itemForSale = planet?.vendor?.items?.find((i) => i.itemType === itemType &&
            i.itemId === itemId &&
            i.buyMultiplier);
        if (!itemForSale || !itemForSale.buyMultiplier)
            return callback({
                error: `That equipment is not for sale here.`,
            });
        const price = dist_1.default.r2((itemForSale.itemData?.basePrice || 1) *
            itemForSale.buyMultiplier *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1), 2, true);
        if (price > ship.commonCredits)
            return callback({ error: `Insufficient funds.` });
        if (ship.chassis.slots <= ship.items.length)
            return callback({
                error: `No slot available to attach any more equipment.`,
            });
        ship.commonCredits -= price;
        ship.toUpdate.commonCredits = ship.commonCredits;
        ship.addItem({ type: itemType, id: itemId });
        ship.logEntry(`${itemForSale.itemData?.displayName} (${itemType}) bought by the captain for ${dist_1.default.r2(price)} credits.`, `high`);
        callback({
            data: dist_1.default.stubify(ship),
        });
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
        if (!planet)
            return callback({ error: `Not at a planet.` });
        dist_1.default.log(itemType, itemId);
        const heldItem = ship.items.find((i) => i.type === itemType && i.id === itemId);
        if (!heldItem)
            return callback({
                error: `Your ship doesn't have that item equipped.`,
            });
        const itemForSale = planet?.vendor?.items?.find((i) => i.itemType === itemType &&
            i.itemId === itemId &&
            i.sellMultiplier);
        const itemData = allItemData[itemType][itemId];
        if (!itemData)
            return callback({
                error: `No item found by that id.`,
            });
        const price = dist_1.default.r2((itemData?.basePrice || 1) *
            (itemForSale?.sellMultiplier ||
                dist_1.default.baseItemSellMultiplier) *
            planet.priceFluctuator *
            (planet.faction === ship.faction
                ? 1 + (1 - dist_1.default.factionVendorMultiplier)
                : 1), 2, true);
        ship.commonCredits += price;
        ship.toUpdate.commonCredits = ship.commonCredits;
        ship.removeItem(heldItem);
        ship.logEntry(`${heldItem.displayName} (${itemType}) sold by the captain for ${dist_1.default.r2(price)} credits.`, `high`);
        callback({
            data: dist_1.default.stubify(ship),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} sold the ship's ${itemType} of id ${itemId}.`);
    });
    socket.on(`ship:swapChassis`, (shipId, crewId, chassisType, callback) => {
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
        if (!planet)
            return callback({ error: `Not at a planet.` });
        const itemForSale = planet?.vendor?.chassis?.find((i) => i.chassisType === chassisType);
        if (!itemForSale ||
            !itemForSale.buyMultiplier ||
            !itemForSale.chassisData)
            return callback({
                error: `That equipment is not for sale here.`,
            });
        const currentChassisSellPrice = ship.chassis.basePrice / 2;
        const price = dist_1.default.r2((itemForSale.chassisData?.basePrice || 1) *
            itemForSale.buyMultiplier *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1) -
            currentChassisSellPrice, 2, true);
        if (price > ship.commonCredits)
            return callback({ error: `Insufficient funds.` });
        if (ship.items.length > itemForSale.chassisData?.slots)
            return callback({
                error: `Your equipment wouldn't all fit! Sell some equipment first, then swap chassis.`,
            });
        ship.commonCredits -= price;
        ship.toUpdate.commonCredits = ship.commonCredits;
        ship.swapChassis(itemForSale.chassisData);
        ship.logEntry(`${itemForSale.chassisData?.displayName} (chassis) bought by the captain for ${dist_1.default.r2(price)} credits.`, `high`);
        callback({
            data: dist_1.default.stubify(ship),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} swapped to the chassis ${chassisType}.`);
    });
}
exports.default = default_1;
//# sourceMappingURL=items.js.map