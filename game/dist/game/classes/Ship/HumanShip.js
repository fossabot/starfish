"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const db_1 = require("../../../db");
const io_1 = __importDefault(require("../../../server/io"));
const crew_1 = require("./addins/crew");
const CombatShip_1 = require("./CombatShip");
const CrewMember_1 = require("../CrewMember/CrewMember");
const Tutorial_1 = require("./addins/Tutorial");
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.guildName = `guild`;
        this.log = [];
        this.logAlertLevel = `medium`;
        this.crewMembers = [];
        this.captain = null;
        this.rooms = {};
        this.maxScanProperties = null;
        this.visible = {
            ships: [],
            planets: [],
            caches: [],
            attackRemnants: [],
            zones: [],
        };
        this.commonCredits = 0;
        this.orders = null;
        this.tutorial = undefined;
        this.membersIn = crew_1.membersIn;
        this.cumulativeSkillIn = crew_1.cumulativeSkillIn;
        this.id = data.id;
        // this.availableTaglines = [] // `Tester`, `Very Shallow`
        // this.availableHeaderBackgrounds = [
        //   `Default`,
        //   // `Flat 1`,
        //   // `Flat 2`,
        //   // `Gradient 1`,
        //   // `Gradient 2`,
        //   // `Gradient 3`,
        //   // `Constellation 1`,
        //   // `Vintage 1`,
        // ]
        // this.availableHeaderBackgrounds.push(
        //   c.capitalize(this.faction.id) + ` Faction 1`,
        // )
        if (data.guildName)
            this.guildName = data.guildName;
        if (data.guildIcon)
            this.guildIcon = data.guildIcon;
        this.ai = false;
        this.human = true;
        this.speed = dist_1.default.vectorToMagnitude(this.velocity);
        this.toUpdate.speed = this.speed;
        this.direction = dist_1.default.vectorToDegrees(this.velocity);
        this.toUpdate.direction = this.direction;
        this.captain = data.captain || null;
        this.orders = data.orders || null;
        this.log = data.log || [];
        if (data.tutorial && data.tutorial.step !== undefined)
            this.tutorial = new Tutorial_1.Tutorial(data.tutorial, this);
        // human ships always know where their homeworld is
        if (this.faction.homeworld &&
            !this.seenPlanets.find((p) => p === this.faction.homeworld))
            this.discoverPlanet(this.faction.homeworld);
        this.recalculateShownPanels();
        if (data.commonCredits)
            this.commonCredits = data.commonCredits;
        if (data.logAlertLevel)
            this.logAlertLevel = data.logAlertLevel;
        this.resolveRooms();
        data.crewMembers?.forEach((cm) => {
            this.addCrewMember(cm, true);
        });
        if (!this.log.length && !this.tutorial)
            // timeout so that the first messages don't spawn multiple alerts channels
            setTimeout(() => this.logEntry([
                `Your crew boards the ship`,
                {
                    text: this.name,
                    color: this.faction.color,
                },
                `for the first time, and sets out towards the stars.`,
            ], `medium`), 2000);
        this.updateMaxScanProperties();
        this.updateVisible();
        this.recalculateMass();
        if (!this.tutorial)
            this.updatePlanet(true);
        if (!this.items.length) {
            dist_1.default.log(`red`, `Attempted to spawn a human ship with no items!`, data.name, data.items);
            this.equipLoadout(`humanDefault`);
        }
        setTimeout(() => {
            this.radii.gameSize = this.game.gameSoftRadius;
            this.toUpdate.radii = this.radii;
        }, 100);
    }
    tick() {
        const profiler = new dist_1.default.Profiler(4, `human ship tick`, false, 0);
        super.tick();
        if (this.dead)
            return;
        if (this.tutorial)
            this.tutorial.tick();
        profiler.step(`move`);
        // ----- move -----
        this.move();
        // ----- planet effects -----
        if (this.planet) {
            this.addStat(`planetTime`, 1);
            if (this.planet.planetType === `basic`) {
                if (this.planet.repairFactor > 0) {
                    const isAllied = (this.planet.allegiances.find((a) => a.faction.id === this.faction.id)?.level || 0) >=
                        dist_1.default.factionAllegianceFriendCutoff;
                    this.repair(this.planet.repairFactor *
                        0.000005 *
                        dist_1.default.gameSpeedMultiplier *
                        (isAllied ? 2 : 1));
                }
            }
        }
        profiler.step(`update visible`);
        // ----- scan -----
        const previousVisible = { ...this.visible };
        this.updateVisible();
        this.generateVisiblePayload(previousVisible);
        this.takeActionOnVisibleChange(previousVisible, this.visible);
        this.scanners.forEach((s) => s.use());
        profiler.step(`crew tick & stubify`);
        this.crewMembers.forEach((cm) => cm.tick());
        this.toUpdate.crewMembers = this.crewMembers
            .filter((cm) => Object.keys(cm.toUpdate || {}).length)
            .map((cm) => {
            const updates = {
                ...dist_1.default.stubify(cm.toUpdate),
                id: cm.id,
            };
            cm.toUpdate = {};
            return updates;
        });
        if (!this.toUpdate.crewMembers?.length)
            delete this.toUpdate.crewMembers;
        // c.log(
        //   `updated ${this.crewMembers.map((cm) =>
        //     Object.keys(cm.toUpdate),
        //   )} crew members on ${this.name}`,
        // )
        // ----- auto-repair -----
        const autoRepairIntensity = (this.getPassiveIntensity(`autoRepair`) / // comes in per hour, we need per tick
            60 /
            60 /
            1000) *
            dist_1.default.tickInterval;
        if (autoRepairIntensity)
            this.repair(autoRepairIntensity);
        profiler.step(`discover planets`);
        // ----- discover new planets -----
        const newPlanets = this.visible.planets.filter((p) => !this.seenPlanets.includes(p));
        newPlanets.forEach((p) => this.discoverPlanet(p));
        // ----- discover new landmarks -----
        const newLandmarks = this.visible.zones.filter((z) => !this.seenLandmarks.includes(z));
        newLandmarks.forEach((p) => this.discoverLandmark(p));
        profiler.step(`get caches`);
        // ----- get nearby caches -----
        // * this is on a random timeout so that the "first" ship doesn't always have priority on picking up caches if 2 or more ships could have gotten it
        setTimeout(() => {
            if (!this.dead)
                this.visible.caches.forEach((cache) => {
                    if (this.isAt(cache.location)) {
                        if (!cache.canBePickedUpBy(this))
                            return;
                        this.getCache(cache);
                    }
                });
        }, Math.round((Math.random() * dist_1.default.tickInterval) / 3));
        profiler.step(`auto attack`);
        // ----- auto-attacks -----
        if (!this.dead)
            this.autoAttack();
        // ----- zone effects -----
        if (!this.dead)
            this.applyZoneTickEffects();
        profiler.step(`frontend stubify`);
        // todo if no io watchers, skip this
        // ----- updates for frontend -----
        this.toUpdate.items = this.items.map((i) => i.stubify());
        profiler.step(`frontend send`);
        // ----- send update to listeners -----
        if (Object.keys(this.toUpdate).length) {
            // c.log(
            //   `sending`,
            //   Object.keys(this.toUpdate).map(
            //     (k) =>
            //       `${k}: ${
            //         JSON.stringify(this.toUpdate[k])?.length
            //       }`,
            //   ),
            //   `characters to frontend for`,
            //   this.name,
            // )
            // this.toUpdate.log?.forEach((l) => {
            //   c.log(l)
            //   if (Array.isArray(l.content))
            //     l.content.forEach((n) => {
            //       if (typeof n === `object`) c.log(n.tooltipData)
            //     })
            // })
            // c.log(JSON.stringify(this.toUpdate.log))
            // c.log(JSON.stringify(this.toUpdate, null, 2))
            io_1.default.to(`ship:${this.id}`).emit(`ship:update`, {
                id: this.id,
                updates: this.toUpdate,
            });
            this.toUpdate = {};
        }
        profiler.end();
    }
    // ----- log -----
    logEntry(content, level = `low`) {
        if (!this.log)
            this.log = [];
        this.log.push({ level, content, time: Date.now() });
        while (this.log.length > HumanShip.maxLogLength)
            this.log.shift();
        this.toUpdate.log = this.log;
        if (this.logAlertLevel === `off`)
            return;
        const levelsToAlert = [this.logAlertLevel];
        if (this.logAlertLevel === `low`)
            levelsToAlert.push(`medium`, `high`, `critical`);
        if (this.logAlertLevel === `medium`)
            levelsToAlert.push(`high`, `critical`);
        if (this.logAlertLevel === `high`)
            levelsToAlert.push(`critical`);
        if (levelsToAlert.includes(level))
            io_1.default.emit(`ship:message`, this.id, Array.isArray(content)
                ? content
                    .map((ce) => (ce.text ||
                    ce) +
                    (ce.url
                        ? ` (${dist_1.default.frontendUrl.replace(/\/s[^/]*\/?$/, ``)}${ce.url})`
                        : ``))
                    .join(` `)
                    .replace(/\s*&nospace/g, ``)
                : content);
    }
    discoverPlanet(p) {
        this.seenPlanets.push(p);
        this.toUpdate.seenPlanets = this.seenPlanets.map((p) => p.toVisibleStub());
        if (!this.onlyCrewMemberIsInTutorial)
            this.logEntry([
                `Discovered the planet`,
                {
                    text: p.name,
                    color: p.color,
                    tooltipData: p.toLogStub(),
                },
                `&nospace!`,
            ], `high`);
        this.addStat(`seenPlanets`, 1);
        if (this.seenPlanets.length >= 5)
            this.addTagline(`Small Pond Paddler`, `discovering 5 planets`);
        if (this.seenPlanets.length >= 10)
            this.addHeaderBackground(`Constellation 1`, `discovering 10 planets`);
        if (this.seenPlanets.length >= 15)
            this.addTagline(`Current Rider`, `discovering 15 planets`);
        if (this.seenPlanets.length >= 30)
            this.addTagline(`Migratory`, `discovering 30 planets`);
        if (this.seenPlanets.length >= 100)
            this.addTagline(`EAC-zy Rider`, `discovering 100 planets`);
    }
    discoverLandmark(l) {
        this.seenLandmarks.push(l);
        this.toUpdate.seenLandmarks = this.seenLandmarks.map((z) => z.toVisibleStub());
        if (!this.onlyCrewMemberIsInTutorial)
            this.logEntry([
                `Discovered`,
                {
                    text: l.name,
                    color: l.color,
                    tooltipData: l.toLogStub(),
                },
                `&nospace!`,
            ], `high`);
        this.addStat(`seenLandmarks`, 1);
    }
    applyThrust(targetLocation, charge, // 0 to 1 % of AVAILABLE charge to use
    thruster) {
        // add xp
        const xpBoostMultiplier = this.passives
            .filter((p) => p.id === `boostXpGain`)
            .reduce((total, p) => (p.intensity || 0) + total, 0) + 1;
        thruster.addXp(`piloting`, dist_1.default.baseXpGain *
            2000 *
            charge *
            thruster.cockpitCharge *
            xpBoostMultiplier);
        charge *= thruster.cockpitCharge;
        if (!HumanShip.movementIsFree)
            thruster.cockpitCharge -= charge;
        const initialVelocity = [
            ...this.velocity,
        ];
        const initialMagnitude = dist_1.default.vectorToMagnitude(initialVelocity);
        const initialAngle = this.direction;
        const memberPilotingSkill = thruster.piloting?.level || 1;
        const engineThrustMultiplier = Math.max(dist_1.default.noEngineThrustMagnitude, this.engines
            .filter((e) => e.repair > 0)
            .reduce((total, e) => total + e.thrustAmplification * e.repair, 0) * dist_1.default.baseEngineThrustMultiplier);
        const magnitudePerPointOfCharge = dist_1.default.getThrustMagnitudeForSingleCrewMember(memberPilotingSkill, engineThrustMultiplier);
        const shipMass = this.mass;
        const thrustMagnitudeToApply = (magnitudePerPointOfCharge * charge) / shipMass;
        let zeroedAngleToTargetInDegrees = dist_1.default.angleFromAToB(this.location, targetLocation);
        let angleToThrustInDegrees = 0;
        const TEMPT_THE_GODS_SEMICOLON_USE_THE_MATH = false;
        if (!TEMPT_THE_GODS_SEMICOLON_USE_THE_MATH) {
            // c.log(`ez mode`)
            angleToThrustInDegrees = zeroedAngleToTargetInDegrees;
        }
        // * Do we dare?????
        else {
            // ----- here comes the math -----
            if (zeroedAngleToTargetInDegrees > 180)
                zeroedAngleToTargetInDegrees -= 360;
            const angleDifferenceFromVelocityToTargetInRadians = (dist_1.default.degreesToRadians(dist_1.default.angleDifference(zeroedAngleToTargetInDegrees, this.direction, true)) +
                2 * Math.PI) %
                (2 * Math.PI);
            // normalized to 0~2pi
            const isAcute = angleDifferenceFromVelocityToTargetInRadians <
                Math.PI / 2 ||
                angleDifferenceFromVelocityToTargetInRadians >
                    Math.PI * (3 / 2);
            let zeroedAngleToThrustInRadians = 0;
            dist_1.default.log({
                initialVelocity,
                initialMagnitude,
                thrustMagnitudeToApply,
                isAcute,
                angleDifferenceFromVelocityToTargetInRadians,
                angleDifferenceFromVelocityToTargetInDegrees: dist_1.default.radiansToDegrees(angleDifferenceFromVelocityToTargetInRadians),
            });
            // * acute case!
            if (isAcute) {
                // the distance to the closest point on the target line from the velocity vector
                const distanceToClosestPointOnTargetLineFromVelocity = Math.abs(initialMagnitude *
                    Math.sin(dist_1.default.degreesToRadians(zeroedAngleToTargetInDegrees)));
                const didHaveExcessMagnitude = thrustMagnitudeToApply >
                    distanceToClosestPointOnTargetLineFromVelocity;
                // angle from the tip of the velocity line that forms a right angle when it intersects the target line
                const zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians = Math.PI -
                    Math.PI / 2 -
                    (angleDifferenceFromVelocityToTargetInRadians <=
                        Math.PI
                        ? angleDifferenceFromVelocityToTargetInRadians
                        : Math.PI -
                            angleDifferenceFromVelocityToTargetInRadians);
                if (!didHaveExcessMagnitude) {
                    dist_1.default.log(`using line that forms right angle to target`);
                    zeroedAngleToThrustInRadians =
                        zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians;
                }
                else {
                    // we have "excess" magnitude, so the line needs to extend out along target line to match magnitude length
                    dist_1.default.log(`adjusting line to account for excess magnitude`);
                    const additionalDistanceToMoveAlongTargetLine = Math.PI -
                        Math.sqrt(thrustMagnitudeToApply ** 2 -
                            distanceToClosestPointOnTargetLineFromVelocity **
                                2);
                    const additionalAngleToAddToThrustAngle = Math.acos((distanceToClosestPointOnTargetLineFromVelocity **
                        2 +
                        thrustMagnitudeToApply ** 2 -
                        additionalDistanceToMoveAlongTargetLine **
                            2) /
                        (2 *
                            distanceToClosestPointOnTargetLineFromVelocity *
                            thrustMagnitudeToApply));
                    // Math.asin(
                    //   (additionalDistanceToMoveAlongTargetLine /
                    //     thrustMagnitudeToApply)
                    // )
                    dist_1.default.log({
                        additionalDistanceToMoveAlongTargetLine,
                        additionalAngleToAddToThrustAngle,
                    });
                    zeroedAngleToThrustInRadians +=
                        additionalAngleToAddToThrustAngle;
                }
                dist_1.default.log({
                    distanceToClosestPointOnTargetLineFromVelocity,
                    didHaveExcessMagnitude,
                    zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians,
                    zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInDegrees: dist_1.default.radiansToDegrees(zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians),
                });
            }
            // * obtuse case
            else {
                const didHaveExcessMagnitude = thrustMagnitudeToApply > initialMagnitude;
                // if it's shorter than the velocity vector
                if (!didHaveExcessMagnitude) {
                    // straight back opposite the velocity vector
                    // ? we know their target point, should we try to make the vector to that point instead?
                    zeroedAngleToThrustInRadians = Math.PI;
                    dist_1.default.log(`thrusting back along velocity vector`);
                }
                // otherwise, we use the excess length to hit the furthest point along the target line that we can
                else {
                    dist_1.default.log(`targeting point along target angle`);
                    const distanceDownThrustAngleFromOriginToHit = Math.sqrt(thrustMagnitudeToApply ** 2 -
                        initialMagnitude ** 2);
                    const angleFromVelocityVectorToPointOnTargetLineInRadians = Math.PI -
                        Math.acos((thrustMagnitudeToApply ** 2 +
                            initialMagnitude ** 2 -
                            distanceDownThrustAngleFromOriginToHit **
                                2) /
                            (2 *
                                thrustMagnitudeToApply *
                                initialMagnitude));
                    // Math.asin(
                    //   (distanceDownThrustAngleFromOriginToHit *
                    //     (Math.sin(
                    //       angleDifferenceFromVelocityToTargetInRadians <
                    //         Math.PI
                    //         ? angleDifferenceFromVelocityToTargetInRadians
                    //         : Math.PI * 2 -
                    //             angleDifferenceFromVelocityToTargetInRadians,
                    //     ) /
                    //       thrustMagnitudeToApply)) %
                    //     1,
                    // )
                    zeroedAngleToThrustInRadians =
                        angleFromVelocityVectorToPointOnTargetLineInRadians;
                    dist_1.default.log({
                        didHaveExcessMagnitude,
                        distanceDownThrustAngleFromOriginToHit,
                        angleFromVelocityVectorToPointOnTargetLineInRadians,
                        angleFromVelocityVectorToPointOnTargetLineInDegrees: dist_1.default.radiansToDegrees(angleFromVelocityVectorToPointOnTargetLineInRadians),
                    });
                }
            }
            dist_1.default.log({
                zeroedAngleToThrustInRadians,
                zeroedAngleToThrustInDegrees: dist_1.default.radiansToDegrees(zeroedAngleToThrustInRadians),
            });
            // this angle assumes we're going at 0 degrees. rotate it to fit the actual current angle...
            angleToThrustInDegrees =
                (this.direction +
                    dist_1.default.radiansToDegrees(zeroedAngleToThrustInRadians) +
                    360) %
                    360;
            if (isNaN(angleToThrustInDegrees))
                return dist_1.default.log(`nan`);
            // ----- done with big math -----
        }
        // const unitVectorToTarget =
        //   c.unitVectorFromThisPointToThatPoint(
        //     this.location,
        //     targetLocation,
        //   )
        // const distanceToTarget = c.distance(
        //   this.location,
        //   targetLocation,
        // )
        // const vectorToTarget = [
        //   unitVectorToTarget[0] * distanceToTarget,
        //   unitVectorToTarget[1] * distanceToTarget,
        // ]
        const unitVectorAlongWhichToThrust = dist_1.default.degreesToUnitVector(angleToThrustInDegrees);
        const thrustVector = [
            unitVectorAlongWhichToThrust[0] *
                thrustMagnitudeToApply,
            unitVectorAlongWhichToThrust[1] *
                thrustMagnitudeToApply,
        ];
        this.velocity = [
            this.velocity[0] + thrustVector[0],
            this.velocity[1] + thrustVector[1],
        ];
        this.toUpdate.velocity = this.velocity;
        this.speed = dist_1.default.vectorToMagnitude(this.velocity);
        this.toUpdate.speed = this.speed;
        this.direction = dist_1.default.vectorToDegrees(this.velocity);
        this.toUpdate.direction = this.direction;
        // const thrustAngle = c.vectorToDegrees(thrustVector)
        // c.log({
        //   mass: this.mass,
        //   charge,
        //   memberPilotingSkill,
        //   engineThrustMultiplier,
        //   magnitudePerPointOfCharge,
        //   finalMagnitude: thrustMagnitudeToApply,
        //   targetLocation,
        //   zeroedAngleToTargetInDegrees,
        //   // unitVectorToTarget,
        //   // vectorToTarget,
        //   thrustVector,
        //   thrustAngle,
        //   initialVelocity,
        //   initialMagnitude,
        //   initialAngle,
        //   velocity: this.velocity,
        //   speed: this.speed,
        //   direction: this.direction,
        // })
        if (charge > 0.25) {
            let targetData;
            const foundPlanet = this.seenPlanets.find((planet) => dist_1.default.distance(planet.location, targetLocation) <
                dist_1.default.arrivalThreshold * 5);
            if (foundPlanet)
                targetData = [
                    {
                        text: foundPlanet.name,
                        color: foundPlanet.color,
                        tooltipData: foundPlanet.toLogStub(),
                    },
                ];
            if (!targetData) {
                const foundCache = this.visible.caches.find((ca) => ca.location[0] === targetLocation[0] &&
                    ca.location[1] === targetLocation[1]);
                if (foundCache)
                    targetData = [
                        {
                            text: `a cache`,
                            color: `var(--cache)`,
                            tooltipData: this.cacheToValidScanResult(foundCache),
                        },
                        `at ${dist_1.default.r2(zeroedAngleToTargetInDegrees, 0)}°`,
                    ];
            }
            if (!targetData) {
                const foundLandmark = this.seenLandmarks.find((l) => dist_1.default.pointIsInsideCircle(l.location, targetLocation, l.radius));
                if (foundLandmark)
                    targetData = [
                        {
                            text: foundLandmark.name,
                            color: foundLandmark.color,
                            tooltipData: foundLandmark.toLogStub(),
                        },
                    ];
            }
            if (!targetData) {
                const foundShip = this.visible.ships.find((s) => dist_1.default.distance(s.location, targetLocation) <
                    dist_1.default.arrivalThreshold * 5);
                if (foundShip) {
                    const fullShip = this.game.ships.find((s) => s.id === foundShip.id);
                    if (fullShip)
                        targetData = [
                            `the ship`,
                            {
                                text: fullShip.name,
                                color: fullShip.faction?.color,
                                tooltipData: fullShip.toLogStub(),
                            },
                        ];
                }
            }
            if (!targetData)
                targetData = [
                    {
                        text: `${dist_1.default.r2(zeroedAngleToTargetInDegrees, 0)}°`,
                    },
                ];
            this.logEntry([
                thruster.name,
                `thrusted towards`,
                ...targetData,
                `at ${dist_1.default.r2(dist_1.default.vectorToMagnitude(thrustVector) * 60 * 60, 3)} AU/hr.`,
            ], `low`);
        }
        if (!HumanShip.movementIsFree)
            this.engines.forEach((e) => e.use(charge));
    }
    brake(charge, thruster) {
        // add xp
        const xpBoostMultiplier = (this.passives.find((p) => p.id === `boostXpGain`)
            ?.intensity || 0) + 1;
        thruster.addXp(`piloting`, dist_1.default.baseXpGain *
            2000 *
            charge *
            thruster.cockpitCharge *
            xpBoostMultiplier);
        charge *= thruster.cockpitCharge;
        if (!HumanShip.movementIsFree)
            thruster.cockpitCharge -= charge;
        charge *= dist_1.default.brakeToThrustRatio; // braking is easier than thrusting
        // apply passive
        let passiveBrakeMultiplier = 1 + this.getPassiveIntensity(`boostBrake`);
        charge *= passiveBrakeMultiplier;
        const memberPilotingSkill = thruster.piloting?.level || 1;
        const engineThrustMultiplier = Math.max(dist_1.default.noEngineThrustMagnitude, this.engines
            .filter((e) => e.repair > 0)
            .reduce((total, e) => total + e.thrustAmplification * e.repair, 0) * dist_1.default.baseEngineThrustMultiplier);
        const magnitudePerPointOfCharge = dist_1.default.getThrustMagnitudeForSingleCrewMember(memberPilotingSkill, engineThrustMultiplier);
        const shipMass = this.mass;
        const finalMagnitude = (magnitudePerPointOfCharge * charge) / shipMass;
        const currentVelocity = [
            ...this.velocity,
        ];
        const currentMagnitude = dist_1.default.vectorToMagnitude(currentVelocity);
        if (finalMagnitude > currentMagnitude)
            this.hardStop();
        else {
            const relativeScaleOfMagnitudeShrink = (currentMagnitude - finalMagnitude) /
                currentMagnitude;
            this.velocity = [
                this.velocity[0] * relativeScaleOfMagnitudeShrink,
                this.velocity[1] * relativeScaleOfMagnitudeShrink,
            ];
        }
        this.toUpdate.velocity = this.velocity;
        this.speed = dist_1.default.vectorToMagnitude(this.velocity);
        this.toUpdate.speed = this.speed;
        this.direction = dist_1.default.vectorToDegrees(this.velocity);
        this.toUpdate.direction = this.direction;
        if (charge > 1.5)
            this.logEntry([
                thruster.name,
                `applied the brakes with ${dist_1.default.r2(magnitudePerPointOfCharge * charge)}`,
                { text: `&nospaceP`, tooltipData: `Poseidons` },
                `of thrust.`,
            ], `low`);
        if (!HumanShip.movementIsFree)
            this.engines.forEach((e) => e.use(charge));
    }
    // ----- move -----
    move(toLocation) {
        super.move(toLocation);
        if (toLocation) {
            this.updateVisible();
            this.updatePlanet();
            return;
        }
        if (!this.canMove) {
            this.hardStop();
            return;
        }
        const startingLocation = [
            ...this.location,
        ];
        this.location[0] += this.velocity[0];
        this.location[1] += this.velocity[1];
        this.toUpdate.location = this.location;
        this.addPreviousLocation(startingLocation, this.location);
        this.updatePlanet();
        this.notifyZones(startingLocation);
        this.addStat(`distanceTraveled`, dist_1.default.distance(startingLocation, this.location));
        const speed = (dist_1.default.vectorToMagnitude(this.velocity) *
            (1000 * 60 * 60)) /
            dist_1.default.tickInterval;
        if (speed > 1)
            this.addTagline(`River Runner`, `going over 1AU/hr`);
        if (speed > 3)
            this.addHeaderBackground(`Crimson Blur`, `going over 3AU/hr`);
        if (speed > 7.21436)
            this.addHeaderBackground(`Lightspeedy`, `breaking the speed of light`);
        if (speed > 15)
            this.addTagline(`Flying Fish`, `going over 15AU/hr`);
        if (speed > 30)
            this.addTagline(`Hell's Angelfish`, `going over 30AU/hr`);
        if (speed > this.getStat(`highestSpeed`))
            this.setStat(`highestSpeed`, speed);
        // ----- end if in tutorial -----
        if (this.tutorial && this.tutorial.currentStep) {
            // reset position if outside max distance from spawn
            if (this.tutorial.currentStep.maxDistanceFromSpawn &&
                dist_1.default.distance(this.tutorial.baseLocation, this.location) > this.tutorial.currentStep.maxDistanceFromSpawn) {
                const unitVectorFromSpawn = dist_1.default.unitVectorFromThisPointToThatPoint(this.tutorial.baseLocation, this.location);
                this.move([
                    this.tutorial.baseLocation[0] +
                        unitVectorFromSpawn[0] *
                            0.999 *
                            this.tutorial.currentStep
                                .maxDistanceFromSpawn,
                    this.tutorial.baseLocation[1] +
                        unitVectorFromSpawn[1] *
                            0.999 *
                            this.tutorial.currentStep
                                .maxDistanceFromSpawn,
                ]);
                this.hardStop();
                this.logEntry(`Automatically stopped the ship — Let's keep it close to home while we're learning the ropes.`, `high`);
            }
            return;
        }
        // ----- game radius -----
        this.radii.gameSize = this.game.gameSoftRadius;
        this.toUpdate.radii = this.radii;
        const isOutsideRadius = dist_1.default.distance([0, 0], this.location) >
            this.game.gameSoftRadius;
        const startedOutsideRadius = dist_1.default.distance([0, 0], startingLocation) >
            this.game.gameSoftRadius;
        if (isOutsideRadius && !startedOutsideRadius) {
            this.hardStop();
            this.logEntry(`Stopped at the edge of the known universe. You can continue, but nothing but the void awaits out here.`, `high`);
        }
        if (!isOutsideRadius && startedOutsideRadius)
            this.logEntry(`Re-entered the known universe.`, `high`);
        // ----- random encounters -----
        const distanceTraveled = dist_1.default.distance(this.location, startingLocation);
        // - space junk -
        if (dist_1.default.lottery(distanceTraveled * (dist_1.default.deltaTime / dist_1.default.tickInterval), 2)) {
            // apply "amount boost" passive
            const amountBoostPassive = this.getPassiveIntensity(`boostDropAmount`);
            const amount = dist_1.default.r2((Math.round(Math.random() * 3 * (Math.random() * 3)) /
                10 +
                1.5) *
                (1 + amountBoostPassive));
            const id = dist_1.default.randomFromArray([
                `oxygen`,
                `salt`,
                `water`,
                `carbon`,
                `plastic`,
                `steel`,
            ]);
            this.distributeCargoAmongCrew([{ id, amount }]);
            this.logEntry([
                `Encountered some space junk and managed to harvest ${amount} ton${amount === 1 ? `` : `s`} of`,
                {
                    text: id,
                    tooltipData: {
                        ...dist_1.default.cargo[id],
                        type: `cargo`,
                    },
                },
                `off of it.`,
            ]);
        }
        // - asteroid hit -
        if (!this.planet &&
            this.attackable &&
            dist_1.default.lottery(distanceTraveled * (dist_1.default.deltaTime / dist_1.default.tickInterval), 5)) {
            let miss = false;
            const hitRoll = Math.random();
            if (hitRoll < 0.1)
                miss = true;
            // random passive miss chance
            else
                miss = hitRoll < this.chassis.agility * 0.5;
            const damage = this._maxHp * dist_1.default.randomBetween(0.01, 0.15);
            this.takeDamage({ name: `an asteroid` }, {
                damage: miss ? 0 : damage,
                miss,
            });
        }
    }
    hardStop() {
        this.velocity = [0, 0];
        this.speed = 0;
        this.toUpdate.velocity = this.velocity;
        this.toUpdate.speed = this.speed;
    }
    updateVisible() {
        const targetTypes = this.tutorial?.currentStep?.visibleTypes;
        const alwaysShowTrailColors = this.passives.find((p) => p.id === `alwaysSeeTrailColors`);
        const visible = this.game.scanCircle(this.location, this.radii.sight, this.id, targetTypes, alwaysShowTrailColors ? `withColors` : true, Boolean(this.tutorial));
        const shipsWithValidScannedProps = visible.ships.map((s) => this.shipToValidScanResult(s));
        this.visible = {
            ...visible,
            ships: shipsWithValidScannedProps,
        };
    }
    generateVisiblePayload(previousVisible) {
        let planetDataToSend = [];
        if (previousVisible?.planets?.length)
            planetDataToSend = this.visible.planets
                .filter((p) => Object.keys(p.toUpdate).length)
                .map((p) => ({
                name: p.name,
                ...dist_1.default.stubify(p.toUpdate),
            }));
        else
            planetDataToSend = this.visible.planets.map((p) => p.toVisibleStub());
        this.toUpdate.visible = {
            ships: this.visible.ships,
            trails: this.visible.trails || [],
            attackRemnants: this.visible.attackRemnants.map((ar) => ar.stubify()),
            planets: planetDataToSend,
            caches: this.visible.caches.map((c) => this.cacheToValidScanResult(c)),
            zones: this.visible.zones.map((z) => z.stubify()),
        };
    }
    takeActionOnVisibleChange(previousVisible, currentVisible) {
        if (!this.planet) {
            const newlyVisiblePlanets = currentVisible.planets.filter((p) => !previousVisible.planets.includes(p));
            newlyVisiblePlanets.forEach((p) => {
                // c.log(`newly visible planet`, this.name, p.name)
                setTimeout(() => {
                    p.broadcastTo(this);
                }, Math.random() * 15 * 60 * 1000); // sometime within 15 minutes
            });
        }
    }
    async updatePlanet(silent) {
        const previousPlanet = this.planet;
        this.planet =
            this.seenPlanets.find((p) => this.isAt(p.location, p.landingRadiusMultiplier)) || false;
        if (previousPlanet == this.planet)
            return;
        this.toUpdate.planet = this.planet
            ? this.planet.stubify()
            : false;
        if (this.planet) {
            // * landed!
            dist_1.default.log(`gray`, `${this.name} landed at ${this.planet.name}`);
            this.hardStop();
            this.planet.rooms.forEach((r) => this.addRoom(r));
            this.planet.passives.forEach((p) => this.applyPassive(p));
            this.planet.addStat(`shipsLanded`, 1);
        }
        else if (previousPlanet) {
            dist_1.default.log(`gray`, `${this.name} departed from ${previousPlanet ? previousPlanet.name : ``}`);
            previousPlanet.rooms.forEach((r) => this.removeRoom(r));
            previousPlanet.passives.forEach((p) => this.removePassive(p));
        }
        if (silent)
            return;
        await dist_1.default.sleep(1); // to resolve the constructor; this.tutorial doesn't exist yet
        // -----  log for you and other ships on that planet when you land/depart -----
        if ((!this.tutorial || this.tutorial.step > 0) &&
            this.planet &&
            !previousPlanet) {
            this.logEntry([
                `Landed on`,
                {
                    text: this.planet.name,
                    color: this.planet.color,
                    tooltipData: this.planet.toLogStub(),
                },
                `&nospace.`,
            ], `high`);
            if (!this.tutorial)
                this.planet.shipsAt.forEach((s) => {
                    if (s === this || !s.planet)
                        return;
                    s.logEntry([
                        {
                            text: this.name,
                            color: this.faction.color,
                            tooltipData: this.toLogStub(),
                        },
                        `landed on`,
                        {
                            text: s.planet.name,
                            color: s.planet.color,
                            tooltipData: s.planet.toLogStub(),
                        },
                        `&nospace.`,
                    ]);
                });
        }
        else if (previousPlanet && !this.planet) {
            this.logEntry([
                `Departed from`,
                {
                    text: previousPlanet.name,
                    color: previousPlanet.color,
                    tooltipData: previousPlanet.toLogStub(),
                },
                `&nospace.`,
            ]);
            if (previousPlanet && !this.tutorial)
                previousPlanet.shipsAt.forEach((s) => {
                    if (s === this || !s.planet)
                        return;
                    s.logEntry([
                        {
                            text: this.name,
                            color: this.faction.color,
                            tooltipData: this.toLogStub(),
                        },
                        `landed on`,
                        {
                            text: s.planet.name,
                            color: s.planet.color,
                            tooltipData: s.planet.toLogStub(),
                        },
                        `&nospace.`,
                    ]);
                });
        }
    }
    getCache(cache) {
        // apply "amount boost" passive
        const amountBoostPassive = this.getPassiveIntensity(`boostDropAmount`);
        if (cache.droppedBy !== this.id && amountBoostPassive)
            cache.contents.forEach((c) => (c.amount += c.amount * amountBoostPassive));
        this.distributeCargoAmongCrew(cache.contents);
        const contentsToLog = [];
        cache.contents.forEach((cc, index) => {
            contentsToLog.push(`${dist_1.default.r2(cc.amount)}${cc.id === `credits` ? `` : ` tons of`}`);
            contentsToLog.push({
                text: cc.id,
                color: `var(--cargo)`,
                tooltipData: cc.id === `credits`
                    ? undefined
                    : {
                        type: `cargo`,
                        id: cc.id,
                    },
            });
            if (index < cache.contents.length - 1)
                contentsToLog.push(` and `);
        });
        this.logEntry([
            `Picked up a cache with`,
            ...contentsToLog,
            `inside!${cache.message &&
                ` There was a message attached which said, "${cache.message}".`}`,
        ], `medium`);
        this.game.removeCache(cache);
        this.addStat(`cachesRecovered`, 1);
    }
    notifyZones(startingLocation) {
        for (let z of this.visible.zones) {
            const startedInside = dist_1.default.pointIsInsideCircle(z.location, startingLocation, z.radius);
            const endedInside = dist_1.default.pointIsInsideCircle(z.location, this.location, z.radius);
            if (startedInside && !endedInside)
                this.logEntry([
                    `Exited`,
                    {
                        text: z.name,
                        color: z.color,
                        tooltipData: z.stubify(),
                    },
                    `&nospace.`,
                ], `high`);
            if (!startedInside && endedInside)
                this.logEntry([
                    `Entered`,
                    {
                        text: z.name,
                        color: z.color,
                        tooltipData: z.stubify(),
                    },
                    `&nospace.`,
                ], `high`);
        }
    }
    updateBroadcastRadius() {
        const passiveEffect = this.passives
            .filter((p) => p.id === `boostBroadcastRange`)
            .reduce((total, p) => total + (p.intensity || 0), 0) + 1;
        this.radii.broadcast =
            Math.max(dist_1.default.baseBroadcastRange, dist_1.default.getRadiusDiminishingReturns(this.communicators.reduce((total, comm) => {
                const currRadius = comm.repair * comm.range;
                return currRadius + total;
            }, 0), this.communicators.length)) * passiveEffect;
        this.toUpdate.radii = this.radii;
    }
    updateThingsThatCouldChangeOnItemChange() {
        super.updateThingsThatCouldChangeOnItemChange();
        this.updateBroadcastRadius();
        this.crewMembers.forEach((c) => c.recalculateAll());
        this.toUpdate._hp = this.hp;
        this.toUpdate._maxHp = this._maxHp;
    }
    recalculateShownPanels() {
        if (!this.tutorial)
            this.shownPanels = undefined;
        else
            this.shownPanels =
                this.tutorial.currentStep?.shownPanels;
        this.toUpdate.shownPanels = this.shownPanels || false;
    }
    equipLoadout(l, removeExisting = false) {
        if (removeExisting)
            this.items = [];
        const res = super.equipLoadout(l);
        if (!res)
            return res;
        this.toUpdate.items = [...this.items];
        this.resolveRooms();
        this.updateThingsThatCouldChangeOnItemChange();
        return true;
    }
    addCommonCredits(amount, member) {
        this.commonCredits += amount;
        this.toUpdate.commonCredits = this.commonCredits;
        if (amount > 100)
            this.logEntry(`${member.name} added ${dist_1.default.r2(amount, 0)} credits to the ship's common fund.`, `low`);
        member.addStat(`totalContributedToCommonFund`, amount);
        if (this.commonCredits > 50000)
            this.addTagline(`Easy Target`, `having 50000 credits in the common fund`);
        else if (this.commonCredits > 200000)
            this.addTagline(`Moneybags`, `having 200000 credits in the common fund`);
    }
    broadcast(message, crewMember) {
        const sanitized = dist_1.default.sanitize(message.replace(/\n/g, ` `)).result;
        let range = this.radii.broadcast;
        const avgRepair = this.communicators.reduce((total, curr) => curr.repair + total, 0) / this.communicators.length;
        const willSendShips = [];
        if (avgRepair > 0.05) {
            crewMember.addXp(`linguistics`, dist_1.default.baseXpGain * 100);
            for (let otherShip of this.game.ships) {
                if (otherShip === this)
                    continue;
                if (otherShip.tutorial)
                    continue;
                const distance = dist_1.default.distance(this.location, otherShip.location);
                if (distance > range)
                    continue;
                willSendShips.push(otherShip);
            }
            for (let otherShip of willSendShips) {
                const distance = dist_1.default.distance(this.location, otherShip.location);
                const antiGarble = this.communicators.reduce((total, curr) => curr.antiGarble * curr.repair + total, 0);
                const crewSkillAntiGarble = (crewMember.skills.find((s) => s.skill === `linguistics`)?.level || 0) / 100;
                const garbleAmount = distance /
                    (range + antiGarble + crewSkillAntiGarble);
                const garbled = dist_1.default.garble(sanitized, garbleAmount);
                const toSend = `${garbled.substring(0, dist_1.default.maxBroadcastLength)}`;
                // can be a stub, so find the real thing
                const actualShipObject = this.game.ships.find((s) => s.id === otherShip.id);
                if (actualShipObject)
                    actualShipObject.receiveBroadcast(actualShipObject.ai ? message : toSend, this, garbleAmount, willSendShips);
            }
        }
        if (!this.planet) {
            this.visible.planets
                .filter((p) => dist_1.default.distance(this.location, p.location) < range)
                .forEach((p) => {
                if (message
                    .toLowerCase()
                    .indexOf(p.name.toLowerCase()) > -1)
                    p.respondTo(message, this);
            });
        }
        this.communicators.forEach((comm) => {
            if (comm.hp > 0) {
                comm.use();
                this.updateBroadcastRadius();
            }
        });
        return willSendShips.length;
    }
    receiveBroadcast(message, from, garbleAmount, recipients) {
        const distance = dist_1.default.distance(this.location, from.location);
        const prefix = `**${`species` in from ? from.species.icon : `🪐`}${from.name}** says: *(${dist_1.default.r2(distance, 2)}AU away, ${dist_1.default.r2(Math.min(100, (1 - garbleAmount) * 100), 0)}% fidelity)*\n`;
        io_1.default.emit(`ship:message`, this.id, `${prefix}\`${message}\``, `broadcast`);
        // * this was annoying and not useful
        // this.communicators.forEach((comm) => comm.use())
        // this.updateBroadcastRadius()
    }
    // ----- room mgmt -----
    resolveRooms() {
        this.rooms = {};
        let roomsToAdd = new Set();
        if (this.tutorial)
            this.tutorial.currentStep?.shownRooms?.forEach((r) => roomsToAdd.add(r));
        else {
            roomsToAdd = new Set([`bunk`, `cockpit`, `repair`]);
            this.items.forEach((item) => {
                item.rooms.forEach((i) => roomsToAdd.add(i));
            });
        }
        for (let room of roomsToAdd)
            this.addRoom(room);
    }
    addRoom(room) {
        if (!(room in this.rooms))
            this.rooms[room] = dist_1.default.rooms[room];
        this.toUpdate.rooms = this.rooms;
    }
    removeRoom(room) {
        this.crewMembers.forEach((cm) => {
            if (cm.location === room) {
                cm.location = `bunk`;
                cm.toUpdate.location = cm.location;
            }
        });
        delete this.rooms[room];
        this.toUpdate.rooms = this.rooms;
    }
    // ----- items -----
    addItem(itemData) {
        const item = super.addItem(itemData);
        if (!item)
            return false;
        if (item.type === `scanner`)
            this.updateMaxScanProperties();
        if (!this.rooms)
            this.rooms = {};
        item.rooms.forEach((room) => {
            if (!(room in this.rooms))
                this.addRoom(room);
        });
        return item;
    }
    removeItem(item) {
        dist_1.default.log(`removing item from`, this.name, item.displayName);
        if (item.rooms) {
            item.rooms.forEach((room) => {
                if (!this.items.find((otherItem) => otherItem !== item &&
                    otherItem.rooms.includes(room)))
                    this.removeRoom(room);
            });
        }
        const res = super.removeItem(item);
        if (item.type === `scanner`)
            this.updateMaxScanProperties();
        return res;
    }
    // ----- crew mgmt -----
    async addCrewMember(data, setupAdd = false) {
        // c.log(data, this.id)
        const cm = new CrewMember_1.CrewMember(data, this);
        // if it is a fully new crew member (and not a temporary ship in the tutorial)
        if (!setupAdd && !this.tutorial) {
            if (this.crewMembers.length > 0)
                this.logEntry(`${cm.name} has joined the ship's crew!`, `high`);
            // if this crew member has already done the tutorial in another ship, skip it
            const foundInOtherShip = this.game.humanShips.find((s) => s.crewMembers.find((otherCm) => otherCm.id === cm.id));
            if (!foundInOtherShip)
                await Tutorial_1.Tutorial.putCrewMemberInTutorial(cm);
            // BUT, if they are the first crew member, still send the tutorial-end messages
            else if (this.crewMembers.length === 0)
                Tutorial_1.Tutorial.endMessages(this);
            io_1.default.to(`user:${cm.id}`).emit(`user:reloadShips`);
        }
        this.crewMembers.push(cm);
        if (!this.captain)
            this.captain = cm.id;
        // c.log(
        //   `gray`,
        //   `Added crew member ${cm.name} to ${this.name}`,
        // )
        if (this.crewMembers.length >= 5)
            this.addTagline(`Guppy`, `having 5 crew members`);
        else if (this.crewMembers.length >= 10)
            this.addTagline(`Schoolin'`, `having 10 crew members`);
        else if (this.crewMembers.length >= 30)
            this.addTagline(`Pod`, `having 30 crew members`);
        else if (this.crewMembers.length >= 100)
            this.addTagline(`Big Fish`, `having 100 crew members`);
        if (!setupAdd)
            await db_1.db.ship.addOrUpdateInDb(this);
        return cm;
    }
    get onlyCrewMemberIsInTutorial() {
        // (or, ALL crew members are in tutorials)
        return ((this.crewMembers.length === 1 &&
            this.crewMembers[0].tutorialShipId) ||
            this.crewMembers.every((cm) => cm.tutorialShipId));
    }
    removeCrewMember(id) {
        const index = this.crewMembers.findIndex((cm) => cm.id === id);
        const cm = this.crewMembers[index];
        if (index === -1) {
            dist_1.default.log(`red`, `Attempted to remove crew member that did not exist ${id} from ship ${this.id}`);
            return;
        }
        if (this.captain === cm.id) {
            dist_1.default.log(`red`, `Attempted to kick the captain from ship ${this.id}`);
            return;
        }
        this.crewMembers.splice(index, 1);
        this.logEntry(`${cm.name} has been kicked from the crew. The remaining crew members watch forlornly as their icy body drifts by the observation window. `, `critical`);
        // * this could be abused to generate infinite money
        // ${cm.name}'s cargo has been distributed amongst the crew.
        // this.distributeCargoAmongCrew([
        //   ...cm.inventory,
        //   { type: `credits`, amount: cm.credits },
        // ])
        db_1.db.ship.addOrUpdateInDb(this);
    }
    distributeCargoAmongCrew(cargo) {
        const leftovers = [];
        cargo.forEach((contents) => {
            let toDistribute = contents.amount;
            const canHoldMore = [...this.crewMembers];
            while (canHoldMore.length && toDistribute) {
                const amountForEach = toDistribute / canHoldMore.length;
                toDistribute = canHoldMore.reduce((total, cm, index) => {
                    if (contents.id === `credits`) {
                        cm.credits = Math.floor(cm.credits + amountForEach);
                        cm.toUpdate.credits = cm.credits;
                    }
                    else {
                        const leftOver = cm.addCargo(contents.id, amountForEach);
                        if (leftOver) {
                            canHoldMore.splice(index, 1);
                            return total + leftOver;
                        }
                        cm.toUpdate.inventory = cm.inventory;
                    }
                    return total;
                }, 0);
            }
            if (toDistribute > 1) {
                const existing = leftovers.find((l) => l.id === contents.id);
                if (existing)
                    existing.amount += toDistribute;
                else
                    leftovers.push({
                        id: contents.id,
                        amount: toDistribute,
                    });
            }
        });
        if (leftovers.length) {
            setTimeout(() => this.logEntry([
                `Your crew couldn't hold everything, so`,
                {
                    text: `some cargo`,
                    tooltipData: {
                        type: `cargo`,
                        cargo: leftovers,
                    },
                },
                `was released as a cache.`,
            ]), 500);
            this.game.addCache({
                location: [...this.location],
                contents: leftovers,
                droppedBy: this.id,
            });
        }
    }
    // -----
    updateMaxScanProperties() {
        // c.log(`updating max scan properties`, this.name)
        const totalShape = {
            ...dist_1.default.baseShipScanProperties,
        };
        for (let scanner of this.scanners) {
            ;
            Object.keys(scanner.shipScanData).forEach((key) => {
                const value = scanner.shipScanData[key];
                if (!totalShape[key] && value === true)
                    totalShape[key] = true;
                if (totalShape[key] === undefined &&
                    Array.isArray(value)) {
                    ;
                    totalShape[key] = value;
                }
                else if (Array.isArray(totalShape[key]) &&
                    Array.isArray(value)) {
                    for (let s of value) {
                        if (!totalShape[key].includes(s))
                            totalShape[key].push(s);
                    }
                }
            });
        }
        this.maxScanProperties = totalShape;
    }
    shipToValidScanResult(ship) {
        let scanPropertiesToUse = dist_1.default.distance(this.location, ship.location) <
            this.radii.scan
            ? this.maxScanProperties || dist_1.default.baseShipScanProperties
            : dist_1.default.baseShipScanProperties;
        // same faction can see a few more properties
        if (ship.faction === this.faction)
            scanPropertiesToUse = {
                ...scanPropertiesToUse,
                ...dist_1.default.sameFactionShipScanProperties,
            };
        const partialShip = {} // sorry to the typescript gods for this one
        ;
        Object.entries(scanPropertiesToUse).forEach(([key, value]) => {
            if (!ship[key])
                return;
            if (key === `crewMembers` &&
                ship.passives.find((p) => p.id === `disguiseCrewMemberCount`))
                return;
            if (key === `chassis` &&
                ship.passives.find((p) => p.id === `disguiseChassisType`))
                return;
            if (value === true)
                partialShip[key] = ship[key];
            if (Array.isArray(value)) {
                if (Array.isArray(ship[key])) {
                    partialShip[key] = ship[key].map((el) => {
                        const returnVal = {};
                        Object.keys(el)
                            .filter((elKey) => value.includes(elKey))
                            .forEach((elKey) => {
                            returnVal[elKey] = el[elKey];
                        });
                        return returnVal;
                    });
                }
                else {
                    partialShip[key] = {};
                    Object.keys(ship[key]).forEach((elKey) => {
                        if (value.includes(elKey))
                            partialShip[key][elKey] = ship[key][elKey];
                    });
                }
            }
        });
        return partialShip;
    }
    cacheToValidScanResult(cache) {
        const isInRange = dist_1.default.distance(this.location, cache.location) <=
            this.radii.scan;
        const partialStub = isInRange
            ? cache.stubify()
            : {
                type: `cache`,
                location: cache.location,
                id: cache.id,
            };
        return partialStub;
    }
    // ----- respawn -----
    async respawn(silent = false) {
        await super.respawn();
        this.equipLoadout(`humanDefault`);
        this.updatePlanet(true);
        this.toUpdate.dead = Boolean(this.dead);
        this.crewMembers.forEach((cm) => {
            cm.targetLocation = null;
            cm.location = `bunk`;
        });
        if (!silent && this instanceof HumanShip) {
            this.logEntry(`Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`, `critical`);
        }
        await db_1.db.ship.addOrUpdateInDb(this);
    }
    // ----- auto attack -----
    autoAttack() {
        const weaponsRoomMembers = this.membersIn(`weapons`);
        if (!weaponsRoomMembers.length)
            return;
        this.toUpdate.targetShip = undefined;
        // ----- gather most common tactic -----
        const tacticCounts = weaponsRoomMembers.reduce((totals, cm) => {
            const currTotal = totals.find((t) => t.tactic === cm.tactic);
            const toAdd = cm.skills.find((s) => s.skill === `munitions`)
                ?.level || 1;
            if (currTotal)
                currTotal.total += toAdd;
            else
                totals.push({ tactic: cm.tactic, total: toAdd });
            return totals;
        }, []);
        const mainTactic = tacticCounts.sort((b, a) => b.total - a.total)?.[0]?.tactic;
        this.mainTactic = mainTactic;
        this.toUpdate.mainTactic = mainTactic;
        const attackableShips = this.getEnemiesInAttackRange();
        this.toUpdate.enemiesInAttackRange =
            attackableShips.map((s) => s.stubify());
        // ----- gather most common item target -----
        const itemTargetCounts = weaponsRoomMembers.reduce((totals, cm) => {
            if (!cm.itemTarget)
                return totals;
            const currTotal = totals.find((t) => t.itemTarget === cm.itemTarget);
            const toAdd = cm.skills.find((s) => s.skill === `munitions`)
                ?.level || 1;
            if (currTotal)
                currTotal.total += toAdd;
            else
                totals.push({
                    target: cm.itemTarget,
                    total: toAdd,
                });
            return totals;
        }, []);
        let mainItemTarget = itemTargetCounts.sort((b, a) => b.total - a.total)?.[0]?.target;
        this.itemTarget = mainItemTarget;
        this.toUpdate.itemTarget = mainItemTarget;
        if (!mainTactic)
            return;
        if (!attackableShips.length)
            return;
        const availableWeapons = this.availableWeapons();
        if (!availableWeapons)
            return;
        // ----- gather most common attack target -----
        const shipTargetCounts = weaponsRoomMembers
            .reduce((totals, cm) => {
            if (!cm.attackTarget)
                return totals;
            const currTotal = totals.find((t) => t.target === cm.attackTarget);
            const toAdd = cm.skills.find((s) => s.skill === `munitions`)
                ?.level || 1;
            if (currTotal)
                currTotal.total += toAdd;
            else
                totals.push({
                    target: cm.attackTarget,
                    total: toAdd,
                });
            return totals;
        }, [])
            .map((totalEntry) => {
            if (!this.canAttack(totalEntry.target))
                totalEntry.total -= 1000; // disincentive for ships out of range, etc, but still possible to end up with them if they're the only ones targeted
            return totalEntry;
        });
        const mainAttackTarget = shipTargetCounts.sort((b, a) => b.total - a.total)?.[0]?.target;
        // ----- defensive strategy -----
        if (mainTactic === `defensive`) {
            let targetShip;
            if (mainAttackTarget &&
                this.canAttack(mainAttackTarget)) {
                const attackedByThatTarget = this.visible.attackRemnants.find((ar) => ar.attacker === mainAttackTarget);
                if (attackedByThatTarget)
                    targetShip = mainAttackTarget;
            }
            else {
                const mostRecentDefense = this.visible.attackRemnants
                    .filter((ar) => ar.attacker.id !== this.id &&
                    !ar.attacker.dead)
                    .reduce((mostRecent, ar) => mostRecent &&
                    mostRecent.time > ar.time &&
                    this.canAttack(mostRecent.attacker)
                    ? mostRecent
                    : ar, null);
                targetShip = mostRecentDefense?.attacker;
            }
            // c.log(`defensive, targeting`, targetShip?.name)
            if (!targetShip)
                return;
            if (!targetShip.stubify)
                // in some cases we end up with a stub here
                targetShip = this.game.ships.find((s) => s.attackable && s.id === targetShip?.id);
            this.toUpdate.targetShip = targetShip
                ? targetShip.stubify()
                : undefined;
            if (targetShip)
                availableWeapons.forEach((w) => {
                    this.attack(targetShip, w, mainItemTarget);
                });
        }
        // ----- aggressive strategy -----
        if (mainTactic === `aggressive`) {
            let targetShip = mainAttackTarget;
            if (targetShip && !this.canAttack(targetShip))
                targetShip = undefined;
            if (!targetShip) {
                // ----- if no attack target, pick the one we were most recently in combat with that's still in range -----
                const mostRecentCombat = this.visible.attackRemnants.reduce((mostRecent, ar) => mostRecent &&
                    mostRecent.time > ar.time &&
                    this.canAttack(mostRecent.attacker.id === this.id
                        ? mostRecent.defender
                        : mostRecent.attacker)
                    ? mostRecent
                    : ar, null);
                if (mostRecentCombat)
                    targetShip =
                        mostRecentCombat.attacker.id === this.id
                            ? mostRecentCombat.defender
                            : mostRecentCombat.attacker;
                // ----- if there is enemy from recent combat that we can hit, just pick the closest enemy -----
                if (!targetShip)
                    targetShip = attackableShips.reduce((closest, curr) => {
                        if (!closest ||
                            dist_1.default.distance(this.location, curr.location) <
                                dist_1.default.distance(this.location, closest.location))
                            return curr;
                        return closest;
                    }, undefined);
            }
            // ----- attack with EVERY AVAILABLE WEAPON -----
            if (!targetShip)
                return;
            if (!targetShip.stubify)
                // in some cases we end up with a stub here
                targetShip = this.game.ships.find((s) => s.attackable && s.id === targetShip?.id);
            this.toUpdate.targetShip = targetShip?.stubify();
            if (targetShip) {
                availableWeapons.forEach((w) => {
                    this.attack(targetShip, w, mainItemTarget);
                });
            }
            else
                this.toUpdate.targetShip = undefined;
        }
    }
    die(attacker) {
        super.die(attacker);
        setTimeout(() => {
            this.logEntry(`Your ship has been destroyed! All cargo and equipment are lost, along with most of your credits, but the crew managed to escape back to their homeworld. Respawn and get back out there!`, `critical`);
            this.addTagline(`Delicious with Lemon`, `having your ship destroyed`);
            if (this.stats.find((s) => s.stat === `deaths`)
                ?.amount === 2)
                this.addHeaderBackground(`Gravestone 1`, `having your ship destroyed twice`);
        }, 100);
        const cacheContents = [];
        this.crewMembers.forEach((cm) => {
            // ----- crew member cargo -----
            while (cm.inventory.length) {
                const toAdd = cm.inventory.pop();
                const existing = cacheContents.find((cc) => cc.id === toAdd?.id);
                if (existing)
                    existing.amount += toAdd?.amount || 0;
                else if (toAdd)
                    cacheContents.push(toAdd);
            }
            // ----- crew member credits -----
            const toCache = cm.credits *
                CombatShip_1.CombatShip.percentOfCreditsDroppedOnDeath;
            cm.credits -=
                cm.credits * CombatShip_1.CombatShip.percentOfCreditsLostOnDeath;
            const existing = cacheContents.find((cc) => cc.id === `credits`);
            if (existing)
                existing.amount += toCache || 0;
            else if (cm.credits)
                cacheContents.push({
                    id: `credits`,
                    amount: toCache,
                });
            cm.location = `bunk`;
            cm.stamina = 0;
        });
        // ----- ship common credits -----
        const lostItemValue = this.items?.reduce((total, item) => total + item.baseData.basePrice, 0) || 0;
        const refundAmount = Math.max(0, lostItemValue - 20000) * 0.2;
        this.commonCredits = refundAmount;
        const toCache = this.commonCredits *
            CombatShip_1.CombatShip.percentOfCreditsDroppedOnDeath;
        this.commonCredits -=
            this.commonCredits *
                CombatShip_1.CombatShip.percentOfCreditsLostOnDeath;
        const existing = cacheContents.find((cc) => cc.id === `credits`);
        if (existing)
            existing.amount += toCache || 0;
        else if (this.commonCredits)
            cacheContents.push({
                id: `credits`,
                amount: toCache,
            });
        if (cacheContents.length)
            this.game.addCache({
                contents: cacheContents,
                location: this.location,
                message: `Remains of ${this.name}`,
            });
    }
    get factionRankings() {
        return this.game.factionRankings;
    }
}
exports.HumanShip = HumanShip;
HumanShip.maxLogLength = 40;
HumanShip.movementIsFree = false; // true
//# sourceMappingURL=HumanShip.js.map