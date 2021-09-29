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
        if (data.pacifist)
            this.pacifist = data.pacifist;
        else
            this.pacifist = false;
        if (data.mine)
            this.mine = data.mine;
        if (!this.mine.length)
            this.levelUp();
    }
    getMineRequirement(cargoId) {
        const rarity = dist_1.default.cargo[cargoId].rarity + 1;
        return Math.floor(((Math.random() + 0.1) * 70000 * (rarity / 3)) /
            2 /
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
        // * ----- done mining, pay out -----
        if (resource.mineCurrent >= resource.mineRequirement) {
            // distribute among all current mining ships
            const shipsToDistributeAmong = this.shipsAt.filter((s) => s.crewMembers.find((cm) => cm.location === `mine` &&
                (cm.minePriority === cargoId ||
                    cm.minePriority === `closest` ||
                    !this.mine.find((m) => m.id === cm.minePriority))));
            const amountBoostPassive = shipsToDistributeAmong.reduce((total, s) => s.getPassiveIntensity(`boostMinePayouts`) +
                total, 0);
            const finalPayoutAmount = resource.payoutAmount * (amountBoostPassive + 1);
            const didBoost = amountBoostPassive > 0;
            dist_1.default.log(`gray`, `${shipsToDistributeAmong.length} ships mined ${finalPayoutAmount} tons of ${cargoId} from ${this.name}.`);
            shipsToDistributeAmong.forEach((ship) => {
                ship.logEntry(shipsToDistributeAmong.length > 1
                    ? [
                        `Your ship helped mine ${dist_1.default.r2(finalPayoutAmount, 0)} tons of`,
                        {
                            text: cargoId,
                            tooltipData: {
                                type: `cargo`,
                                id: cargoId,
                            },
                            color: `var(--cargo)`,
                        },
                        `&nospace, ${didBoost
                            ? `(passive payout boost: +${dist_1.default.r2(amountBoostPassive) * 100}%) `
                            : ``}which was split with ${shipsToDistributeAmong.length - 1} other ship ${shipsToDistributeAmong.length - 1 === 1
                            ? ``
                            : `s`}`,
                    ]
                    : [
                        `Your ship mined ${dist_1.default.r2(finalPayoutAmount, 0)} tons of`,
                        {
                            text: cargoId,
                            tooltipData: {
                                type: `cargo`,
                                id: cargoId,
                            },
                            color: `var(--cargo)`,
                        },
                        `&nospace${didBoost
                            ? ` (passive payout boost: +${dist_1.default.r2(amountBoostPassive) * 100}%)`
                            : ``}.`,
                    ]);
                const crewMembersWhoHelped = ship.crewMembers.filter((cm) => cm.location === `mine` &&
                    (cm.minePriority === cargoId ||
                        cm.minePriority === `closest` ||
                        !this.mine.find((m) => m.id === cm.minePriority)));
                crewMembersWhoHelped.forEach((cm) => {
                    cm.addStat(`totalTonsMined`, finalPayoutAmount /
                        shipsToDistributeAmong.length /
                        crewMembersWhoHelped.length);
                });
                ship.addStat(`totalTonsMined`, finalPayoutAmount);
                ship.distributeCargoAmongCrew([
                    {
                        id: cargoId,
                        amount: dist_1.default.r2(finalPayoutAmount /
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
        if (this.level > 1) {
            this.addPassive({
                id: `boostMineSpeed`,
                intensity: 0.05,
            });
        }
        // todo add more passives
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
    resetLevels() {
        const targetLevel = this.level;
        const targetXp = this.xp;
        this.level = 0;
        this.xp = 0;
        this.mine = [];
        while (this.level < targetLevel) {
            this.levelUp();
        }
        this.xp = targetXp;
        this.updateFrontendForShipsAt();
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


*/
//# sourceMappingURL=MiningPlanet.js.map