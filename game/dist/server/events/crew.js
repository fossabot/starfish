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
    socket.on(`crew:itemTarget`, (shipId, crewId, targetId) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        crewMember.itemTarget = targetId;
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
            { amount: amount, type: `credits` },
        ]);
        dist_1.default.log(`gray`, `The captain on ${ship.name} redistributed ${amount} from the common fund.`);
    });
    socket.on(`crew:buyCargo`, (shipId, crewId, cargoType, amount, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const planet = ship.game.planets.find((p) => p.name === vendorLocation);
        const cargoForSale = planet?.vendor?.cargo?.find((cfs) => cfs.cargoData.type === cargoType &&
            cfs.buyMultiplier);
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
        const price = dist_1.default.r2(cargoForSale.cargoData.basePrice *
            cargoForSale.buyMultiplier *
            amount *
            planet?.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1), 2, true);
        if (price > crewMember.credits)
            return callback({ error: `Insufficient funds.` });
        crewMember.credits -= price;
        const existingStock = crewMember.inventory.find((cargo) => cargo.type === cargoType);
        if (existingStock)
            existingStock.amount = dist_1.default.r2(amount + existingStock.amount, 2, true);
        else
            crewMember.inventory.push({
                type: cargoType,
                amount,
            });
        callback({
            data: dist_1.default.stubify(crewMember),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought ${amount} ${cargoType} from ${vendorLocation}.`);
    });
    socket.on(`crew:sellCargo`, (shipId, crewId, cargoType, amount, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        amount = dist_1.default.r2(amount, 2, true);
        const existingStock = crewMember.inventory.find((cargo) => cargo.type === cargoType);
        if (!existingStock || existingStock.amount < amount)
            return callback({
                error: `Not enough stock of that cargo found.`,
            });
        const planet = ship.game.planets.find((p) => p.name === vendorLocation);
        const cargoBeingBought = planet?.vendor?.cargo?.find((cbb) => cbb.cargoData.type === cargoType &&
            cbb.sellMultiplier);
        if (!planet || !cargoBeingBought)
            return callback({
                error: `The vendor does not buy that.`,
            });
        const price = dist_1.default.r2(cargoBeingBought.cargoData.basePrice *
            cargoBeingBought.sellMultiplier *
            amount *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? 1 + (1 - (dist_1.default.factionVendorMultiplier || 1))
                : 1), 2, true);
        crewMember.credits += price;
        existingStock.amount -= amount;
        if (existingStock.amount < 0.01)
            existingStock.amount = 0;
        callback({
            data: dist_1.default.stubify(crewMember),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} sold ${amount} ${cargoType} to ${vendorLocation}.`);
    });
    socket.on(`crew:drop`, (shipId, crewId, cargoType, amount, message, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        amount = dist_1.default.r2(amount, 2, true);
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
    socket.on(`crew:buyPassive`, (shipId, crewId, passiveType, vendorLocation, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const planet = ship.game.planets.find((p) => p.name === vendorLocation);
        const passiveForSale = planet?.vendor?.passives?.find((pfs) => pfs.passiveData?.type === passiveType &&
            pfs.buyMultiplier);
        if (!planet ||
            !passiveForSale ||
            !passiveForSale.passiveData)
            return callback({
                error: `That passive is not for sale here.`,
            });
        const currentLevel = crewMember.passives.find((p) => p.type === passiveType)?.level || 0;
        const price = dist_1.default.r2(passiveForSale.passiveData.basePrice *
            passiveForSale.buyMultiplier *
            dist_1.default.getCrewPassivePriceMultiplier(currentLevel) *
            planet.priceFluctuator *
            ((planet.allegiances.find((a) => a.faction.id === ship.faction.id)?.level || 0) >= dist_1.default.factionAllegianceFriendCutoff
                ? dist_1.default.factionVendorMultiplier
                : 1), 2, true);
        if (price > crewMember.credits)
            return callback({ error: `Insufficient funds.` });
        crewMember.credits -= price;
        crewMember.addPassive(passiveForSale.passiveData);
        callback({
            data: dist_1.default.stubify(crewMember),
        });
        planet.incrementAllegiance(ship.faction);
        dist_1.default.log(`gray`, `${crewMember.name} on ${ship.name} bought passive ${passiveType} from ${vendorLocation}.`);
    });
}
exports.default = default_1;
//# sourceMappingURL=crew.js.map