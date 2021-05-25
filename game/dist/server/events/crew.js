"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
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
        crewMemberBaseData.name =
            crewMemberBaseData.name.substring(0, dist_1.default.maxNameLength);
        const addedCrewMember = ship.addCrewMember(crewMemberBaseData);
        const stub = dist_1.default.stubify(addedCrewMember);
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
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} location to ${target}.`);
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
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} targetLocation to ${targetLocation}.`);
    });
    socket.on(`crew:tactic`, (shipId, crewId, tactic) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        crewMember.tactic = tactic;
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} tactic to ${tactic}.`);
    });
    socket.on(`crew:attackTarget`, (shipId, crewId, targetId) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        const targetShip = __1.game.ships.find((s) => s.id === targetId) || null;
        crewMember.attackTarget = targetShip;
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} attack target to ${targetShip?.name}.`);
    });
    socket.on(`crew:repairPriority`, (shipId, crewId, repairPriority) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        crewMember.repairPriority = repairPriority;
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} repair priority to ${repairPriority}.`);
    });
    socket.on(`crew:contribute`, (shipId, crewId, amount) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        if (amount > crewMember.credits)
            return;
        crewMember.credits -= amount;
        ship.addCommonCredits(amount, crewMember);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} contributed ${amount} to the common fund.`);
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
        if (crewMember.heldWeight + amount >
            crewMember.maxCargoWeight)
            return callback({
                error: `That's too heavy to fit into your cargo space.`,
            });
        const price = Math.round(cargoForSale.cargoData.basePrice *
            cargoForSale.buyMultiplier *
            amount *
            10000) / 10000;
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
            data: dist_1.default.stubify(crewMember),
        });
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought ${amount} ${cargoType} from ${vendorLocation}.`);
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
        const price = Math.round(cargoBeingBought.cargoData.basePrice *
            cargoBeingBought.sellMultiplier *
            amount *
            10000) / 10000;
        crewMember.credits += price;
        existingStock.amount -= amount;
        callback({
            data: dist_1.default.stubify(crewMember),
        });
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} sold ${amount} ${cargoType} to ${vendorLocation}.`);
    });
    socket.on(`crew:drop`, (shipId, crewId, cargoType, amount, message, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        if (cargoType === `credits`) {
            if (crewMember.credits < amount)
                return callback({
                    error: `Not enough credits found.`,
                });
            crewMember.credits -= amount;
        }
        else {
            const existingStock = crewMember.inventory.find((cargo) => cargo.type === cargoType);
            if (!existingStock || existingStock.amount < amount)
                return callback({
                    error: `Not enough stock of that cargo found.`,
                });
            existingStock.amount -= amount;
        }
        const cache = __1.game.addCache({
            location: [...ship.location],
            contents: [{ type: cargoType, amount }],
            droppedBy: ship.id,
            message: dist_1.default.sanitize(message).result,
        });
        ship.logEntry(`${crewMember.name} dropped a cache containing ${amount}${cargoType === `credits` ? `` : ` tons of`} ${cargoType}.`);
        callback({
            data: dist_1.default.stubify(cache),
        });
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} dropped ${amount} ${cargoType}.`);
    });
    socket.on(`crew:buyRepair`, (shipId, crewId, hp, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const repairMultiplier = ship.game.planets.find((p) => p.name === vendorLocation)?.repairCostMultiplier;
        if (!repairMultiplier)
            return callback({
                error: `This planet does not offer mechanics.`,
            });
        const price = Math.round(repairMultiplier * dist_1.default.baseRepairCost * hp * 10000) / 10000;
        if (price > crewMember.credits)
            return callback({ error: `Insufficient funds.` });
        crewMember.credits -= price;
        let remainingHp = hp;
        while (true) {
            const prev = remainingHp;
            remainingHp -= crewMember.repairAction(remainingHp);
            if (prev === remainingHp)
                break;
        }
        ship.logEntry(`${crewMember.name} bought ${Math.round(hp * 100) / 100} hp worth of repairs.`, `medium`);
        crewMember.addStat(`totalContributedToCommonFund`, price);
        callback({
            data: dist_1.default.stubify(crewMember),
        });
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought ${hp} hp of repairs from ${vendorLocation}.`);
    });
}
exports.default = default_1;
//# sourceMappingURL=crew.js.map