"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planet = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const Stubbable_1 = require("../Stubbable");
class Planet extends Stubbable_1.Stubbable {
    constructor({ planetType, name, color, location, mass, landingRadiusMultiplier, passives, pacifist, creatures, radius, xp, level, baseLevel, }, game) {
        super();
        this.type = `planet`;
        this.rooms = [];
        this.xp = 0;
        this.level = 0;
        this.toUpdate = {};
        this.game = game;
        this.planetType = planetType || `basic`;
        this.name = name;
        this.color = color;
        this.location = location;
        this.radius = radius;
        this.mass =
            mass ||
                ((5.974e30 * this.radius) / 36000) *
                    Planet.massAdjuster;
        this.landingRadiusMultiplier =
            landingRadiusMultiplier || 1;
        this.passives = passives || [];
        this.pacifist = pacifist || true;
        this.creatures = creatures || [];
        this.level = level;
        this.xp = xp;
        // * timeout so it has time to run subclass contstructor
        setTimeout(() => {
            if (this.level === 0)
                this.levelUp();
            const levelsToApply = baseLevel - this.level;
            for (let i = 0; i < levelsToApply; i++)
                this.levelUp();
        }, 100);
    }
    get shipsAt() {
        return this.game.humanShips.filter((s) => s.planet === this);
    }
    async addXp(amount, straightUp = false) {
        if (!amount)
            return;
        if (!straightUp)
            amount /= 100;
        this.xp = Math.round(this.xp + amount);
        const previousLevel = this.level;
        this.level = dist_1.default.levels.findIndex((l) => (this.xp || 0) <= l);
        const levelDifference = this.level - previousLevel;
        dist_1.default.log({
            amount,
            previousLevel,
            levelDifference,
            xp: this.xp,
        });
        for (let i = 0; i < levelDifference; i++) {
            await this.levelUp();
        }
        if (!levelDifference) {
            this.updateFrontendForShipsAt();
        }
    }
    async levelUp() {
        this.level++;
        if (this.xp < dist_1.default.levels[this.level - 1]) {
            // this will only happen when levelling up from 0, randomize a bit so it's not clear if NO one has ever been here before
            this.xp =
                dist_1.default.levels[this.level - 1] +
                    Math.floor(Math.random() * 100);
        }
    }
    updateFrontendForShipsAt() {
        this._stub = null;
        this.shipsAt.forEach((s) => {
            s.toUpdate.planet = this.stubify();
        });
    }
    getVisibleStub() {
        return this.stubify();
    }
    toLogStub() {
        const s = this.stubify();
        return {
            ...s,
            type: `planet`,
            landingRadiusMultiplier: undefined,
        };
    }
    // function placeholders
    incrementAllegiance(faction, amount) { }
}
exports.Planet = Planet;
Planet.massAdjuster = 1;
//# sourceMappingURL=Planet.js.map