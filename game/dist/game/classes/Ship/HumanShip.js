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
const rooms_1 = require("../../presets/rooms");
const Tutorial_1 = require("./addins/Tutorial");
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
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
        this.ai = false;
        this.human = true;
        this.speed = dist_1.default.vectorToMagnitude(this.velocity);
        this.toUpdate.speed = this.speed;
        this.direction = dist_1.default.vectorToDegrees(this.velocity);
        this.toUpdate.direction = this.direction;
        this.captain = data.captain || null;
        this.log = data.log || [];
        if (data.tutorial && data.tutorial.step !== undefined)
            this.tutorial = new Tutorial_1.Tutorial(data.tutorial, this);
        this.recalculateShownPanels();
        if (data.commonCredits)
            this.commonCredits = data.commonCredits;
        if (data.logAlertLevel)
            this.logAlertLevel = data.logAlertLevel;
        this.resolveRooms();
        data.crewMembers?.forEach((cm) => {
            this.addCrewMember(cm, true);
        });
        if (!this.log.length)
            this.logEntry(`Your crew boards the ship ${this.name} for the first time, and sets out towards the stars.`, `medium`);
        this.updateMaxScanProperties();
        this.updateVisible();
        this.recalculateMass();
        if (!this.tutorial)
            this.updatePlanet(true);
        setTimeout(() => {
            this.radii.game = this.game.gameSoftRadius;
            this.toUpdate.radii = this.radii;
        }, 100);
        // passively lose previous locations over time
        // so someone who, for example, sits forever at a planet loses their trail eventually
        setInterval(() => {
            if (!this.previousLocations.length)
                return;
            this.previousLocations.shift();
            // c.log(`removing previous location`)
        }, (dist_1.default.TICK_INTERVAL * 100000) / dist_1.default.gameSpeedMultiplier);
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
        profiler.step(`update visible`);
        // ----- scan -----
        const previousVisible = { ...this.visible };
        this.updateVisible();
        this.generateVisiblePayload(previousVisible);
        this.scanners.forEach((s) => s.use());
        profiler.step(`crew tick & stubify`);
        this.crewMembers.forEach((cm) => cm.tick());
        this.toUpdate.crewMembers = this.crewMembers
            .filter((cm) => Object.keys(cm.toUpdate).length)
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
        profiler.step(`discover planets`);
        // ----- discover new planets -----
        const newPlanets = this.visible.planets.filter((p) => !this.seenPlanets.includes(p));
        newPlanets.forEach((p) => this.discoverPlanet(p));
        if (newPlanets.length)
            db_1.db.ship.addOrUpdateInDb(this);
        profiler.step(`get caches`);
        // ----- get nearby caches -----
        if (!this.dead)
            this.visible.caches.forEach((cache) => {
                if (this.isAt(cache.location)) {
                    if (!cache.canBePickedUpBy(this))
                        return;
                    // apply "amount boost" passive
                    const amountBoostPassive = (this.passives.filter((p) => p.id === `boostDropAmount`) || []).reduce((total, p) => total + (p.intensity || 0), 0);
                    if (cache.droppedBy !== this.id &&
                        amountBoostPassive)
                        cache.contents.forEach((c) => (c.amount += c.amount * amountBoostPassive));
                    this.distributeCargoAmongCrew(cache.contents);
                    this.logEntry(`Picked up a cache with ${cache.contents
                        .map((cc) => `${dist_1.default.r2(cc.amount)}${cc.type === `credits` ? `` : ` tons of`} ${cc.type}`)
                        .join(` and `)} inside!${cache.message &&
                        ` There was a message attached which said, "${cache.message}".`}`, `medium`);
                    this.game.removeCache(cache);
                }
            });
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
            io_1.default.to(`ship:${this.id}`).emit(`ship:update`, {
                id: this.id,
                updates: this.toUpdate,
            });
            this.toUpdate = {};
        }
        profiler.end();
    }
    // ----- log -----
    logEntry(text, level = `low`) {
        this.log.push({ level, text, time: Date.now() });
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
            io_1.default.emit(`ship:message`, this.id, text);
    }
    discoverPlanet(p) {
        this.seenPlanets.push(p);
        this.toUpdate.seenPlanets = this.seenPlanets.map((p) => p.getVisibleStub());
        this.logEntry(`Discovered the planet ${p.name}!`, `high`);
        if (this.seenPlanets.length > 5)
            this.addTagline(`Small Pond Paddler`, `discovering 5 planets`);
        else if (this.seenPlanets.length > 15)
            this.addTagline(`Current Rider`, `discovering 15 planets`);
        else if (this.seenPlanets.length > 30)
            this.addTagline(`Migratory`, `discovering 30 planets`);
        else if (this.seenPlanets.length > 100)
            this.addTagline(`EAC-zy Rider`, `discovering 100 planets`);
    }
    applyThrust(targetLocation, charge, // 0 to 1 % of AVAILABLE charge to use
    thruster) {
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
            .reduce((total, e) => total + e.thrustAmplification * e.repair, 0));
        const magnitudePerPointOfCharge = dist_1.default.getThrustMagnitudeForSingleCrewMember(memberPilotingSkill, engineThrustMultiplier);
        const shipMass = this.mass;
        const thrustMagnitudeToApply = (magnitudePerPointOfCharge * charge) / shipMass;
        let zeroedAngleToTargetInDegrees = dist_1.default.angleFromAToB(this.location, targetLocation);
        let angleToThrustInDegrees = 0;
        const TEMPT_THE_GODS_SEMICOLON_USE_THE_MATH = false;
        if (!TEMPT_THE_GODS_SEMICOLON_USE_THE_MATH) {
            dist_1.default.log(`ez mode`);
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
        const thrustAngle = dist_1.default.vectorToDegrees(thrustVector);
        this.velocity = [
            this.velocity[0] + thrustVector[0],
            this.velocity[1] + thrustVector[1],
        ];
        this.toUpdate.velocity = this.velocity;
        this.speed = dist_1.default.vectorToMagnitude(this.velocity);
        this.toUpdate.speed = this.speed;
        this.direction = dist_1.default.vectorToDegrees(this.velocity);
        this.toUpdate.direction = this.direction;
        if (this.speed > 3)
            this.addTagline(`River Runner`, `going over 3AU/hr`);
        else if (this.speed > 7)
            this.addTagline(`Flying Fish`, `going over 7AU/hr`);
        else if (this.speed > 12)
            this.addTagline(`Hell's Angelfish`, `going over 12AU/hr`);
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
        if (charge > 0.1)
            this.logEntry(`${thruster.name} thrusted towards ${dist_1.default.r2(zeroedAngleToTargetInDegrees, 0)}° with ${dist_1.default.r2(magnitudePerPointOfCharge * charge)}P of thrust.`, `low`);
        if (!HumanShip.movementIsFree)
            this.engines.forEach((e) => e.use(charge));
    }
    brake(charge, thruster) {
        charge *= thruster.cockpitCharge;
        if (!HumanShip.movementIsFree)
            thruster.cockpitCharge -= charge;
        charge *= 3; // braking is easier
        const memberPilotingSkill = thruster.piloting?.level || 1;
        const engineThrustMultiplier = Math.max(dist_1.default.noEngineThrustMagnitude, this.engines
            .filter((e) => e.repair > 0)
            .reduce((total, e) => total + e.thrustAmplification * e.repair, 0));
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
        if (charge > 0.1)
            this.logEntry(`${thruster.name} applied the brakes with ${dist_1.default.r2(magnitudePerPointOfCharge * charge)}P of thrust.`, `low`);
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
        // ----- end if in tutorial -----
        if (this.tutorial) {
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
        this.radii.game = this.game.gameSoftRadius;
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
        if (dist_1.default.lottery(distanceTraveled * (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL), 2)) {
            // apply "amount boost" passive
            const amountBoostPassive = (this.passives.filter((p) => p.id === `boostDropAmount`) || []).reduce((total, p) => total + (p.intensity || 0), 0);
            const amount = (Math.round(Math.random() * 3 * (Math.random() * 3)) /
                10 +
                1.5) *
                (1 + amountBoostPassive);
            const type = dist_1.default.randomFromArray([
                `oxygen`,
                `salt`,
                `water`,
            ]);
            this.distributeCargoAmongCrew([
                { type: type, amount },
            ]);
            this.logEntry(`Encountered some space junk and managed to harvest ${amount} ton${amount === 1 ? `` : `s`} of ${type} off of it.`);
        }
        // - asteroid hit -
        if (dist_1.default.lottery(distanceTraveled * (dist_1.default.deltaTime / dist_1.default.TICK_INTERVAL), 5)) {
            if (!this.attackable || this.planet)
                return;
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
        const targetTypes = this.tutorial?.currentStep.visibleTypes;
        const visible = this.game.scanCircle(this.location, this.radii.sight, this.id, targetTypes, true, Boolean(this.tutorial));
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
            planetDataToSend = this.visible.planets.map((p) => p.getVisibleStub());
        this.toUpdate.visible = {
            ships: this.visible.ships,
            trails: this.visible.trails || [],
            attackRemnants: this.visible.attackRemnants.map((ar) => ar.stubify()),
            planets: planetDataToSend,
            caches: this.visible.caches.map((c) => c.stubify()),
            zones: this.visible.zones.map((z) => z.stubify()),
        };
    }
    async updatePlanet(silent) {
        const previousPlanet = this.planet;
        this.planet =
            this.game.planets.find((p) => this.isAt(p.location)) || false;
        if (previousPlanet !== this.planet) {
            this.toUpdate.planet = this.planet
                ? this.planet.stubify()
                : false;
            if (this.planet)
                this.hardStop();
        }
        if (silent)
            return;
        await dist_1.default.sleep(100); // to resolve the constructor; this.tutorial doesn't exist yet
        // -----  log for you and other ships on that planet when you land/depart -----
        if ((!this.tutorial || this.tutorial.step > 0) &&
            this.planet &&
            !previousPlanet) {
            this.logEntry(`Landed on ${this.planet ? this.planet.name : ``}.`, `high`);
            if (!this.tutorial)
                this.planet.shipsAt.forEach((s) => {
                    if (s === this)
                        return;
                    s.logEntry(`${this.name} landed on ${this.planet ? this.planet.name : ``}.`);
                });
        }
        else if (previousPlanet && !this.planet) {
            this.logEntry(`Departed from ${previousPlanet ? previousPlanet.name : ``}.`);
            if (previousPlanet && !this.tutorial)
                previousPlanet.shipsAt.forEach((s) => {
                    if (s === this)
                        return;
                    s.logEntry(`${this.name} departed from ${previousPlanet ? previousPlanet.name : ``}.`);
                });
        }
    }
    notifyZones(startingLocation) {
        for (let z of this.visible.zones) {
            const startedInside = dist_1.default.pointIsInsideCircle(z.location, startingLocation, z.radius);
            const endedInside = dist_1.default.pointIsInsideCircle(z.location, this.location, z.radius);
            if (startedInside && !endedInside)
                this.logEntry(`Exited ${z.name}.`, `high`);
            if (!startedInside && endedInside)
                this.logEntry(`Entered ${z.name}.`, `high`);
        }
    }
    updateBroadcastRadius() {
        this.radii.broadcast = dist_1.default.getRadiusDiminishingReturns(this.communicators.reduce((total, comm) => {
            const currRadius = comm.repair * comm.range;
            return currRadius + total;
        }, 0), this.communicators.length);
        this.toUpdate.radii = this.radii;
    }
    updateThingsThatCouldChangeOnItemChange() {
        super.updateThingsThatCouldChangeOnItemChange();
        this.updateBroadcastRadius();
        this.toUpdate._hp = this.hp;
        this.toUpdate._maxHp = this._maxHp;
    }
    recalculateShownPanels() {
        if (!this.tutorial)
            this.shownPanels = undefined;
        else
            this.shownPanels =
                this.tutorial.currentStep.shownPanels;
        this.toUpdate.shownPanels = this.shownPanels;
    }
    equipLoadout(l, removeExisting = false) {
        if (removeExisting)
            this.items = [];
        const res = super.equipLoadout(l);
        if (!res)
            return res;
        this.toUpdate.items = this.items;
        this.updateThingsThatCouldChangeOnItemChange();
        this.updateBroadcastRadius();
        return true;
    }
    addCommonCredits(amount, member) {
        this.commonCredits += amount;
        this.toUpdate.commonCredits = this.commonCredits;
        member.addStat(`totalContributedToCommonFund`, amount);
        if (this.commonCredits > 50000)
            this.addTagline(`Easy Target`, `having 50000 credits in the common fund`);
        else if (this.commonCredits > 200000)
            this.addTagline(`Moneybags`, `having 200000 credits in the common fund`);
    }
    broadcast(message, crewMember) {
        const sanitized = dist_1.default.sanitize(message.replace(/\n/g, ` `)).result;
        const range = this.radii.broadcast;
        let didSendCount = 0;
        for (let otherShip of this.visible.ships.filter((s) => s.human)) {
            const distance = dist_1.default.distance(this.location, otherShip.location);
            if (distance > range)
                continue;
            didSendCount++;
            const antiGarble = this.communicators.reduce((total, curr) => curr.antiGarble * curr.repair + total, 0);
            const crewSkillAntiGarble = (crewMember.skills.find((s) => s.skill === `linguistics`)?.level || 0) / 100;
            const garbleAmount = distance /
                (range + antiGarble + crewSkillAntiGarble);
            const garbled = dist_1.default.garble(sanitized, garbleAmount);
            const toSend = `**🚀${this.name}** says: *(${dist_1.default.r2(distance, 2)}AU away, ${dist_1.default.r2(Math.min(100, (1 - garbleAmount) * 100), 0)}% fidelity)*\n\`${garbled.substring(0, dist_1.default.maxBroadcastLength)}\``;
            // can be a stub, so find the real thing
            const actualShipObject = this.game.humanShips.find((s) => s.id === otherShip.id);
            if (actualShipObject)
                actualShipObject.receiveBroadcast(toSend);
        }
        this.communicators.forEach((comm) => comm.use());
        this.updateBroadcastRadius();
        crewMember.addXp(`linguistics`, dist_1.default.baseXpGain * 20);
        return didSendCount;
    }
    receiveBroadcast(message) {
        io_1.default.emit(`ship:message`, this.id, message, `broadcast`);
        this.communicators.forEach((comm) => comm.use());
        this.updateBroadcastRadius();
    }
    // ----- room mgmt -----
    resolveRooms() {
        this.rooms = {};
        let roomsToAdd = [];
        if (this.tutorial)
            roomsToAdd =
                this.tutorial.currentStep?.shownRooms || [];
        else
            roomsToAdd = [`bunk`, `cockpit`, `repair`, `weapons`];
        for (let room of roomsToAdd)
            this.addRoom(room);
    }
    addRoom(room) {
        if (!(room in this.rooms))
            this.rooms[room] = rooms_1.rooms[room];
        this.toUpdate.rooms = this.rooms;
    }
    removeRoom(room) {
        delete this.rooms[room];
        this.toUpdate.rooms = this.rooms;
    }
    // ----- items -----
    addItem(itemData) {
        const res = super.addItem(itemData);
        if (itemData.type === `scanner`)
            this.updateMaxScanProperties();
        return res;
    }
    removeItem(item) {
        const res = super.removeItem(item);
        if (item.type === `scanner`)
            this.updateMaxScanProperties();
        return res;
    }
    // ----- crew mgmt -----
    addCrewMember(data, silent = false) {
        const cm = new CrewMember_1.CrewMember(data, this);
        this.crewMembers.push(cm);
        if (!this.captain)
            this.captain = cm.id;
        // c.log(
        //   `gray`,
        //   `Added crew member ${cm.name} to ${this.name}`,
        // )
        if (!silent && this.crewMembers.length > 1)
            this.logEntry(`${cm.name} has joined the ship's crew!`, `high`);
        if (this.crewMembers.length >= 5)
            this.addTagline(`Guppy`, `having 5 crew members`);
        else if (this.crewMembers.length >= 10)
            this.addTagline(`Schoolin'`, `having 10 crew members`);
        else if (this.crewMembers.length >= 30)
            this.addTagline(`Pod`, `having 30 crew members`);
        else if (this.crewMembers.length >= 100)
            this.addTagline(`Big Fish`, `having 100 crew members`);
        db_1.db.ship.addOrUpdateInDb(this);
        return cm;
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
                    if (contents.type === `credits`) {
                        cm.credits += amountForEach;
                        cm.toUpdate.credits = cm.credits;
                    }
                    else {
                        const leftOver = cm.addCargo(contents.type, amountForEach);
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
                const existing = leftovers.find((l) => l.type === contents.type);
                if (existing)
                    existing.amount += toDistribute;
                else
                    leftovers.push({
                        type: contents.type,
                        amount: toDistribute,
                    });
            }
        });
        if (leftovers.length) {
            setTimeout(() => this.logEntry(`Your crew couldn't hold everything, so some cargo was released as a cache.`), 500);
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
    // ----- respawn -----
    respawn(silent = false) {
        super.respawn();
        this.equipLoadout(`humanDefault`);
        this.updatePlanet(true);
        this.toUpdate.dead = this.dead;
        this.crewMembers.forEach((cm) => {
            cm.targetLocation = null;
            cm.location = `bunk`;
        });
        if (!silent && this instanceof HumanShip) {
            this.logEntry(`Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`, `critical`);
        }
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
        this.toUpdate.enemiesInAttackRange = dist_1.default.stubify(attackableShips, [`visible`, `seenPlanets`]);
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
        const shipTargetCounts = weaponsRoomMembers.reduce((totals, cm) => {
            if (!cm.attackTarget)
                return totals;
            const currTotal = totals.find((t) => t.attackTarget === cm.attackTarget);
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
        }, []);
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
            dist_1.default.log(`defensive, targeting`, targetShip?.name);
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
                targetShip = mostRecentCombat
                    ? mostRecentCombat.attacker.id === this.id
                        ? mostRecentCombat.defender
                        : mostRecentCombat.attacker
                    : attackableShips.reduce(
                    // ----- if all else fails, just attack whatever's closest -----
                    (closest, curr) => {
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
    die() {
        super.die();
        setTimeout(() => {
            this.logEntry(`Your ship has been destroyed! All cargo and equipment are lost, along with most of your credits, but the crew managed to escape back to their homeworld. Respawn and get back out there!`, `critical`);
        }, 100);
        this.addTagline(`Delicious with Lemon`, `having your ship destroyed`);
        const cacheContents = [];
        this.crewMembers.forEach((cm) => {
            // ----- crew member cargo -----
            while (cm.inventory.length) {
                const toAdd = cm.inventory.pop();
                const existing = cacheContents.find((cc) => cc.type === toAdd?.type);
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
            const existing = cacheContents.find((cc) => cc.type === `credits`);
            if (existing)
                existing.amount += toCache || 0;
            else if (cm.credits)
                cacheContents.push({
                    type: `credits`,
                    amount: toCache,
                });
            cm.location = `bunk`;
            cm.stamina = 0;
        });
        // ----- ship common credits -----
        const toCache = this.commonCredits *
            CombatShip_1.CombatShip.percentOfCreditsDroppedOnDeath;
        this.commonCredits -=
            this.commonCredits *
                CombatShip_1.CombatShip.percentOfCreditsLostOnDeath;
        const existing = cacheContents.find((cc) => cc.type === `credits`);
        if (existing)
            existing.amount += toCache || 0;
        else if (this.commonCredits)
            cacheContents.push({
                type: `credits`,
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
HumanShip.maxLogLength = 20;
HumanShip.movementIsFree = true;
//# sourceMappingURL=HumanShip.js.map