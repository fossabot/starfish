"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningPlanet = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Planet_1 = require("./Planet");
class MiningPlanet extends Planet_1.Planet {
    constructor(data, game) {
        super(data, game);
        this.rooms = [`mine`];
        this.mine = [];
        this.baseMineSpeed = 1;
        if (data.pacifist)
            this.pacifist = data.pacifist;
        else
            this.pacifist = false;
        if (data.mine)
            this.mine = data.mine;
        if (data.baseMineSpeed && this.baseMineSpeed === 1)
            this.baseMineSpeed = data.baseMineSpeed;
        // this.level = 0
        // this.mine = []
        // this.baseMineSpeed = 1
        if (!this.mine.length)
            this.levelUp();
    }
    getMineRequirement(cargoId) {
        const rarity = dist_1.default.cargo[cargoId].rarity + 1;
        return Math.floor(((Math.random() + 0.1) * 70000 * (rarity / 3)) /
            this.baseMineSpeed /
            dist_1.default.gameSpeedMultiplier);
    }
    getPayoutAmount(cargoId) {
        return Math.floor(1 +
            Math.random() *
                20 *
                dist_1.default.lerp(1, 10, this.level / 100));
    }
    mineResource(cargoId, amount) {
        if (cargoId === `closest` ||
            !this.mine.find((m) => m.id === cargoId))
            cargoId = this.mine.reduce((closest, m) => closest.mineCurrent / closest.mineRequirement >
                m.mineCurrent / m.mineRequirement
                ? closest
                : m, this.mine[0]).id;
        const resource = this.mine.find((m) => m.id === cargoId);
        if (!resource)
            return;
        resource.mineCurrent += amount;
        if (resource.mineCurrent >= resource.mineRequirement) {
            // distribute among all current mining ships
            const shipsToDistributeAmong = this.shipsAt.filter((s) => s.crewMembers.find((cm) => cm.location === `mine` &&
                (cm.minePriority === cargoId ||
                    cm.minePriority === `closest` ||
                    !this.mine.find((m) => m.id === cm.minePriority))));
            dist_1.default.log(`gray`, `${shipsToDistributeAmong.length} ships mined ${resource.payoutAmount} tons of ${cargoId} from ${this.name}.`);
            shipsToDistributeAmong.forEach((ship) => {
                ship.logEntry(shipsToDistributeAmong.length > 1
                    ? [
                        `Your ship helped mine ${dist_1.default.r2(resource.payoutAmount, 0)} tons of ${cargoId}, which was split with ${shipsToDistributeAmong.length - 1} other ship ${shipsToDistributeAmong.length - 1 === 1
                            ? ``
                            : `s`}`,
                    ]
                    : [
                        `Your ship mined ${dist_1.default.r2(resource.payoutAmount, 0)} tons of ${cargoId}.`,
                    ]);
                const crewMembersWhoHelped = ship.crewMembers.filter((cm) => cm.location === `mine` &&
                    (cm.minePriority === cargoId ||
                        cm.minePriority === `closest` ||
                        !this.mine.find((m) => m.id === cm.minePriority)));
                crewMembersWhoHelped.forEach((cm) => {
                    cm.addStat(`totalTonsMined`, resource.payoutAmount /
                        crewMembersWhoHelped.length);
                });
                ship.addStat(`totalTonsMined`, resource.payoutAmount);
                // todo make sure that when things inevitably overflow into caches, that the same ship doesn't get to pick up every cache in one tick
                // todo make it so that if overflow WOULD turn into a cache, that it tries first to distribute among anyone onboard who may still have space in their inventory
                ship.distributeCargoAmongCrew([
                    {
                        id: cargoId,
                        amount: dist_1.default.r2(resource.payoutAmount /
                            shipsToDistributeAmong.length, 0, true),
                    },
                ]);
            });
            // reset for next time
            resource.mineRequirement =
                this.getMineRequirement(cargoId);
            resource.payoutAmount = this.getPayoutAmount(cargoId);
            resource.mineCurrent = 0;
        }
        this.updateFrontendForShipsAt();
    }
    async levelUp() {
        super.levelUp();
        if (this.level > 1)
            this.baseMineSpeed *= 1.05;
        // todo make passives possible
        // todo add boostMineSpeed passive
        if (this.mine.length === 0 || Math.random() > 0.6) {
            // * randomly selected for now
            const mineableResourceToAdd = dist_1.default.randomFromArray(Object.keys(dist_1.default.cargo));
            this.addMineResource(mineableResourceToAdd);
        }
        this.updateFrontendForShipsAt();
    }
    addMineResource(toAdd) {
        if (this.mine.find((m) => m.id === toAdd))
            return;
        this.mine.push({
            id: toAdd,
            mineCurrent: 0,
            mineRequirement: this.getMineRequirement(toAdd),
            payoutAmount: this.getPayoutAmount(toAdd),
        });
    }
}
exports.MiningPlanet = MiningPlanet;
/*

----- mining planets -----
- have specific types of resource you can mine
gathered resources are held by the individual who mined them, and shared once that crew member's inventory is full
must put crew members into "mining" room aka planetside, actually mining
  select what resource you want to mine
add mining skill?
more ships mining from the same faction boosts mining speed
- can have more desaturated colors
- have no allegiances, but DO have levels


-- how can we make this more interesting/dangerous? --
you get nothing until your team has fully mined x amount
random attacks from indigenous creatures/birds
- ships are still attackable on mining planets


-- levels --
- leveling up a mining planet will, thematically, add mining outposts to the planet, increasing mining efficiency and possibly increasing the number of resources you can mine


-- ideas --
depletion over time?


todo verify that adding cargo to a ship with multiple crew members won't skip over a leftover 0.01, and add cargo to a random crew member first so that micro adds won't always give to the same person

todo more planet types?

*/
//# sourceMappingURL=MiningPlanet.js.map