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
        crewMember.toUpdate.targetLocation =
            crewMember.targetLocation;
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
        crewMember.toUpdate.tactic = crewMember.tactic;
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
        crewMember.toUpdate.attackTarget =
            crewMember.attackTarget;
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} attack target to ${targetShip?.name}.`);
    });
    socket.on(`crew:itemTarget`, (shipId, crewId, targetId) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        crewMember.itemTarget = targetId;
        crewMember.toUpdate.itemTarget = crewMember.itemTarget;
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} item target to ${targetId}.`);
    });
    socket.on(`crew:repairPriority`, (shipId, crewId, repairPriority) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        crewMember.repairPriority = repairPriority;
        crewMember.toUpdate.repairPriority =
            crewMember.repairPriority;
        dist_1.default.log(`gray`, `Set ${crewMember.name} on ${ship.name} repair priority to ${repairPriority}.`);
    });
    socket.on(`crew:contribute`, (shipId, crewId, amount) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        amount = dist_1.default.r2(amount, 2, true);
        if (amount > crewMember.credits)
            return;
        crewMember.credits -= amount;
        crewMember.toUpdate.credits = crewMember.credits;
        ship.addCommonCredits(amount, crewMember);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} contributed ${amount} to the common fund.`);
    });
    socket.on(`ship:redistribute`, (shipId, crewId, amount) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        if (ship.captain !== crewMember.id)
            return;
        amount = dist_1.default.r2(amount, 2, true);
        if (amount > ship.commonCredits)
            return;
        ship.commonCredits -= amount;
        ship.toUpdate.commonCredits = ship.commonCredits;
        ship.logEntry(`The captain dispersed ${dist_1.default.r2(amount)} credits from the common fund amongst the crew.`);
        ship.distributeCargoAmongCrew([
            { amount: amount, id: `credits` },
        ]);
        dist_1.default.log(`gray`, `The captain on ${ship.name} redistributed ${amount} from the common fund.`);
    });
    socket.on(`crew:buyCargo`, (shipId, crewId, cargoId, amount, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const planet = ship.game.planets.find((p) => p.name === vendorLocation);
        const cargoForSale = planet?.vendor?.cargo?.find((cfs) => cfs.cargoId === cargoId && cfs.buyMultiplier);
        if (!planet || !cargoForSale)
            return callback({
                error: `That cargo is not for sale here.`,
            });
        amount = dist_1.default.r2(amount, 2, true);
        if (crewMember.heldWeight + amount >
            Math.min(ship.chassis.maxCargoSpace, crewMember.maxCargoSpace))
            return callback({
                error: `That's too heavy to fit into your cargo space.`,
            });
        const price = Math.max(dist_1.default.cargo[cargoForSale.cargoId].basePrice *
            cargoForSale.buyMultiplier *
            amount *
            planet?.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1));
        dist_1.default.log({ price, credits: crewMember.credits });
        if (price > crewMember.credits)
            return callback({ error: `Insufficient funds.` });
        crewMember.credits = Math.round(crewMember.credits - price);
        crewMember.toUpdate.credits = crewMember.credits;
        crewMember.addCargo(cargoId, amount);
        crewMember.addStat(`cargoTransactions`, 1);
        callback({
            data: crewMember.stubify(),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought ${amount} ${cargoId} from ${vendorLocation}.`);
    });
    socket.on(`crew:sellCargo`, (shipId, crewId, cargoId, amount, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        amount = dist_1.default.r2(amount, 2);
        const existingStock = crewMember.inventory.find((cargo) => cargo.id === cargoId);
        if (!existingStock || existingStock.amount < amount)
            return callback({
                error: `Not holding enough stock of that cargo.`,
            });
        const planet = ship.game.planets.find((p) => p.name === vendorLocation);
        const cargoBeingBought = planet?.vendor?.cargo?.find((cbb) => cbb.cargoId === cargoId && cbb.sellMultiplier);
        if (!planet || !cargoBeingBought)
            return callback({
                error: `The vendor does not buy that.`,
            });
        const price = Math.min(dist_1.default.cargo[cargoBeingBought.cargoId].basePrice *
            cargoBeingBought.sellMultiplier *
            amount *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? 1 + (1 - (dist_1.default.factionVendorMultiplier || 1))
                : 1));
        crewMember.credits = Math.round(crewMember.credits + price);
        crewMember.toUpdate.credits = crewMember.credits;
        crewMember.removeCargo(cargoId, amount);
        crewMember.addStat(`cargoTransactions`, 1);
        callback({
            data: crewMember.stubify(),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} sold ${amount} ${cargoId} to ${vendorLocation}.`);
    });
    socket.on(`crew:drop`, (shipId, crewId, cargoId, amount, message, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        amount = dist_1.default.r2(amount, 2, true);
        if (cargoId === `credits`) {
            if (crewMember.credits < amount)
                return callback({
                    error: `Not enough credits found.`,
                });
            crewMember.credits -= amount;
            crewMember.toUpdate.credits = crewMember.credits;
        }
        else {
            const existingStock = crewMember.inventory.find((cargo) => cargo.id === cargoId);
            if (!existingStock || existingStock.amount < amount)
                return callback({
                    error: `Not enough stock of that cargo found.`,
                });
            existingStock.amount -= amount;
            crewMember.toUpdate.inventory = crewMember.inventory;
        }
        const cache = __1.game.addCache({
            location: [...ship.location],
            contents: [{ id: cargoId, amount }],
            droppedBy: ship.id,
            message: dist_1.default.sanitize(message).result,
        });
        ship.logEntry(`${crewMember.name} dropped a cache containing ${amount}${cargoId === `credits` ? `` : ` tons of`} ${cargoId}.`);
        callback({
            data: dist_1.default.stubify(cache),
        });
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} dropped ${amount} ${cargoId}.`);
    });
    socket.on(`crew:buyRepair`, (shipId, crewId, hp, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const planet = ship.game.planets.find((p) => p.name === vendorLocation);
        const repairMultiplier = planet?.repairCostMultiplier;
        if (!planet || !repairMultiplier)
            return callback({
                error: `This planet does not offer mechanics.`,
            });
        const price = dist_1.default.r2(repairMultiplier *
            dist_1.default.baseRepairCost *
            hp *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1), 2, true);
        if (price > crewMember.credits)
            return callback({ error: `Insufficient funds.` });
        crewMember.credits -= price;
        crewMember.toUpdate.credits = crewMember.credits;
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
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought ${hp} hp of repairs from ${vendorLocation}.`);
    });
    socket.on(`crew:buyPassive`, (shipId, crewId, passiveId, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const planet = ship.game.planets.find((p) => p.name === vendorLocation);
        const passiveForSale = planet?.vendor?.passives?.find((pfs) => pfs.passiveId === passiveId && pfs.buyMultiplier);
        if (!planet ||
            !passiveForSale ||
            !dist_1.default.crewPassives[passiveForSale.passiveId])
            return callback({
                error: `That passive is not for sale here.`,
            });
        const currentLevel = crewMember.passives.find((p) => p.id === passiveId)
            ?.level || 0;
        const price = dist_1.default.r2(dist_1.default.crewPassives[passiveForSale.passiveId].basePrice *
            passiveForSale.buyMultiplier *
            dist_1.default.getCrewPassivePriceMultiplier(currentLevel) *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1), 2, true);
        if (price > crewMember.credits)
            return callback({ error: `Insufficient funds.` });
        crewMember.credits -= price;
        crewMember.addPassive(dist_1.default.crewPassives[passiveForSale.passiveId]);
        callback({
            data: dist_1.default.stubify(crewMember),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought passive ${passiveId} from ${vendorLocation}.`);
    });
    socket.on(`crew:thrust`, (shipId, crewId, chargePercent, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const targetLocation = crewMember.targetLocation;
        if (!targetLocation)
            return callback({
                error: `You're not targeting any location to thrust towards!`,
            });
        ship.applyThrust(targetLocation, chargePercent, crewMember);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} thrusted.`);
    });
    socket.on(`crew:brake`, (shipId, crewId, chargePercent, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        ship.brake(chargePercent, crewMember);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} thrusted.`);
    });
}
exports.default = default_1;
//# sourceMappingURL=crew.js.map