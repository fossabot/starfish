"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
const io_1 = require("../io");
function default_1(socket) {
    socket.on(`crew:add`, (shipId, crewMemberBaseData, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({
                error: `No ship found by that id.`,
            });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewMemberBaseData.id);
        if (crewMember)
            return callback({
                error: `That crew member already exists on this ship.`,
            });
        const addedCrewMember = ship.addCrewMember(crewMemberBaseData);
        const stub = io_1.stubify(addedCrewMember);
        callback({ data: stub });
    });
    socket.on(`crew:move`, (shipId, crewId, target) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        crewMember.goTo(target);
        dist_1.default.log(`Set crew member`, crewMember.name, `on ship`, ship.name, `location to`, target);
    });
    socket.on(`crew:targetLocation`, (shipId, crewId, targetLocation) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        if (!Array.isArray(targetLocation) ||
            targetLocation.length !== 2 ||
            targetLocation.find((l) => isNaN(parseInt(l))))
            return dist_1.default.log(`Invalid call to set crew targetLocation:`, shipId, crewId, targetLocation);
        crewMember.targetLocation = targetLocation;
        dist_1.default.log(`Set`, crewId, `on`, shipId, `targetLocation to`, targetLocation);
    });
    socket.on(`crew:buy`, (shipId, crewId, cargoType, amount, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const cargoForSale = ship.game.planets
            .find((p) => p.name === vendorLocation)
            ?.vendor?.cargo?.find((cfs) => cfs.cargoData.type === cargoType &&
            cfs.buyMultiplier);
        if (!cargoForSale)
            return callback({
                error: `That cargo is not for sale here.`,
            });
        const price = cargoForSale.cargoData.basePrice *
            cargoForSale.buyMultiplier *
            amount;
        if (price > crewMember.credits)
            return callback({ error: `Insufficient funds.` });
        crewMember.credits -= price;
        const existingStock = crewMember.inventory.find((cargo) => cargo.type === cargoType);
        if (existingStock)
            existingStock.amount += amount;
        else
            crewMember.inventory.push({
                type: cargoType,
                amount,
            });
        callback({
            data: io_1.stubify(crewMember),
        });
        dist_1.default.log(crewId, `bought`, amount, cargoType, `from`, vendorLocation);
    });
    socket.on(`crew:sell`, (shipId, crewId, cargoType, amount, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const existingStock = crewMember.inventory.find((cargo) => cargo.type === cargoType);
        if (!existingStock || existingStock.amount < amount)
            return callback({
                error: `Not enough stock of that cargo found.`,
            });
        const cargoBeingBought = ship.game.planets
            .find((p) => p.name === vendorLocation)
            ?.vendor?.cargo?.find((cbb) => cbb.cargoData.type === cargoType &&
            cbb.sellMultiplier);
        if (!cargoBeingBought)
            return callback({
                error: `The vendor does not buy that.`,
            });
        const price = cargoBeingBought.cargoData.basePrice *
            cargoBeingBought.sellMultiplier *
            amount;
        crewMember.credits += price;
        existingStock.amount -= amount;
        callback({
            data: io_1.stubify(crewMember),
        });
        dist_1.default.log(crewId, `sold`, amount, cargoType, `to`, vendorLocation);
    });
}
exports.default = default_1;
//# sourceMappingURL=crew.js.map