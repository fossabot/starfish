"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tutorial = void 0;
const dist_1 = __importDefault(require("../../../../../../common/dist"));
const io_1 = __importDefault(require("../../../../server/io"));
const db_1 = require("../../../../db");
class Tutorial {
    constructor(data, ship) {
        this.step = 0;
        this.steps = [];
        this.baseLocation = [0, 0];
        this.ship = ship;
        this.initializeSteps();
        this.step = data.step;
        this.baseLocation = [
            ...(this.ship.faction.homeworld?.location || [0, 0]),
        ];
        this.currentStep = this.steps[0];
        if (this.step === -1) {
            // * timeout to give a chance to initialize the crew member in the ship and save it, THEN start
            setTimeout(async () => {
                let retries = 0;
                while (this.ship.crewMembers.length === 0 &&
                    retries < 100) {
                    await dist_1.default.sleep(100);
                    retries++;
                }
                this.advanceStep();
            }, 1);
            this.currentStep = this.steps[this.step];
        }
    }
    static async putCrewMemberInTutorial(crewMember) {
        dist_1.default.log(`Spawning tutorial ship for crew member ${crewMember.id}`);
        const tutorialShip = await crewMember.ship.game.addHumanShip({
            name: crewMember.ship.name,
            tutorial: { step: -1 },
            id: `tutorial-${crewMember.ship.id}-${crewMember.id}`,
            species: { id: crewMember.ship.species.id },
        });
        await tutorialShip.addCrewMember({
            name: crewMember.name,
            id: crewMember.id,
            mainShipId: crewMember.ship.id,
        });
        crewMember.tutorialShipId = tutorialShip.id;
        crewMember.toUpdate.tutorialShipId =
            crewMember.tutorialShipId;
        await db_1.db.ship.addOrUpdateInDb(crewMember.ship);
        return tutorialShip;
    }
    initializeSteps() {
        this.steps = [
            {
                forceLocation: [0, 0],
                sightRange: 0.03,
                shownRooms: [],
                shownPanels: [],
                disableStamina: true,
                disableRepair: true,
                forceLoadout: `tutorial1`,
                visibleTypes: [],
                script: [
                    {
                        message: `Welcome to ${dist_1.default.gameName}! To get started, log in at ${dist_1.default.frontendUrl.replace(/\/s$/gi, ``)}`,
                        channel: `alert`,
                    },
                    {
                        message: `You made it! Cool!`,
                        next: `VERY cool.`,
                    },
                    {
                        message: `And it looks like you've figured out how to click a button.`,
                        next: `Sure did!`,
                    },
                    {
                        message: `That's good news, because the ability to click buttons is the only skill you'll need to pilot a ship.<br />
            Let's get started!`,
                        next: `Yeah!`,
                    },
                    {
                        message: `Welcome to ${dist_1.default.gameName}!<br />
            This is a game about exploring space in a ship crewed by your Discord server's members.<br /><br />
            Get into huge-scale battles with rival factions of real people!<br />
            Communicate (poorly) with servers from all over the world!<br />
            Build a trade empire! Upgrade your ship, and level up your personal character!<br /><br />
            Your adventure will be slow-paced (until it's not), so it's best to participate incrementally over the course of days and weeks.`,
                        next: `Sounds good!`,
                    },
                    {
                        message: `But first, a little backstory...<br /><br />
            Remember Earth?<br />
            Humans really did a number on that one, huh?<br />
            They did a pretty good job of wiping each other out, though.<br /><br />
            Not that we were left with much, though.<br />
            Us fish had to rush to evolve our brains and technology to the point where we could escape from the dying planet we were left on.<br /><br />
            Now the fish roam the stars, colonizing the galaxy with aquatic utopias wherever we can.`,
                        next: `Woah. Is it only fish out here?`,
                    },
                    {
                        message: `Hah! If only.<br /><br />
            Some of the craftier species of birds also made it off of Earth.<br />
            They haven't changed at all — they'll hunt down any fish they get their beady little eyes on. Steer clear of them if you can!<br /><br />
            Besides the birds, I'm not sure what else managed to make it off of Earth.`,
                        next: `I see...`,
                    },
                    {
                        message: `It's dark in here. Let's turn the lights on!`,
                        advance: `Turn on scanner`,
                    },
                ],
                nextStepTrigger: { awaitFrontend: true },
            },
            {
                sightRange: 0.03,
                shownRooms: [],
                shownPanels: [`mapZoom`, `ship`],
                highlightPanel: `mapZoom`,
                disableRepair: true,
                disableStamina: true,
                visibleTypes: [`planet`],
                script: [
                    {
                        message: `That's better!<br />
        This is what's near us. See that big dot? That's the planet we're on!`,
                        next: `I see!`,
                    },
                    {
                        message: `That little dot in the middle? That's us! Tiny, huh?<br />
        It turns out that space is HUGE.`,
                        next: `Sure is!`,
                    },
                    {
                        message: `Let's zoom out a little bit.`,
                        advance: `See More`,
                    },
                    // {
                    //   message: `broadcast from here`,
                    //   channel: `broadcast`,
                    // },
                ],
                nextStepTrigger: {
                    awaitFrontend: true,
                },
            },
            // ----- flight & caches -----
            {
                sightRange: 0.03,
                shownRooms: [],
                shownPanels: [`mapZoom`, `map`, `ship`],
                highlightPanel: `map`,
                disableRepair: true,
                disableStamina: true,
                visibleTypes: [`planet`, `cache`],
                script: [
                    {
                        message: `Oho! That's clarified things a bit. We can now see for 0.03AU, which is a pretty long way, galactically speaking — somewhere around 4.5 million kilometers.`,
                        next: `Cool.`,
                    },
                    {
                        message: `You can zoom and pan the big map to get more perspective.<br />
            Things are going swimmingly!`,
                        next: `Wait, what's that?`,
                    },
                    {
                        message: `Ooh, it looks like a <b>cache!</b><br/>
            There must be good stuff inside!<br />
            Let's go check it out!`,
                        advance: `Yeah!`,
                    },
                ],
                caches: [
                    {
                        contents: [{ amount: 10, id: `credits` }],
                        location: [0.015, 0],
                    },
                ],
                nextStepTrigger: {
                    awaitFrontend: true,
                },
            },
            {
                sightRange: 0.03,
                maxDistanceFromSpawn: 0.03,
                resetView: true,
                shownRooms: [`cockpit`],
                forceCrewLocation: `cockpit`,
                forceCockpitCharge: 0.9,
                shownPanels: [`mapZoom`, `map`, `room`, `ship`],
                highlightPanel: `room`,
                disableRepair: true,
                disableStamina: true,
                visibleTypes: [`planet`, `cache`, `trail`],
                script: [
                    {
                        message: `Click on the big map to set a destination.<br />
            While you're in the <b>cockpit</b>, you will slowly charge up thrust (unique to you).<br /><br />
            Click and hold the <b>Thrust</b> button in the cockpit pane to use your charged thrust toward your chosen direction!<br />
            Since we're in space, once you start moving in a direction, you'll keep floating that way! That means that even a small ship can generate a huge amount of speed over time.<br /><br />
            Try to <b>move the ship to the cache we found!</b>`,
                    },
                ],
                nextStepTrigger: {
                    location: {
                        location: [0.015, 0],
                        label: `cache`,
                    },
                },
            },
            {
                sightRange: 0.03,
                maxDistanceFromSpawn: 0.03,
                shownRooms: [`cockpit`],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `log`,
                ],
                highlightPanel: `inventory`,
                disableRepair: true,
                disableStamina: true,
                forceCockpitCharge: 0.85,
                visibleTypes: [`planet`, `trail`],
                script: [
                    {
                        message: `Awesome, we got it! <br /><br/>
            There were some 💳credits inside! Credits are how you pay for cargo and equipment. Every crew member has their own stock of cargo and credits.<br /><br/>
            This one was close by, but most things in space are <i>astronomically</i> far apart. Don't be surprised if it sometimes takes a day or more to reach your next destination.`,
                        advance: `Got it.`,
                    },
                ],
                nextStepTrigger: { awaitFrontend: true },
            },
            {
                sightRange: 0.03,
                maxDistanceFromSpawn: 0.03,
                shownRooms: [`cockpit`],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `log`,
                ],
                highlightPanel: `room`,
                disableRepair: true,
                disableStamina: true,
                forceCockpitCharge: 0.85,
                visibleTypes: [`planet`, `trail`],
                script: [
                    {
                        message: `Now we're drifting through space, though. Click and hold <b>Brake</b> to fire the thrusters in the opposite direction and come to a complete stop.`,
                    },
                ],
                nextStepTrigger: { stopped: true },
            },
            {
                sightRange: 0.03,
                maxDistanceFromSpawn: 0.03,
                shownRooms: [`cockpit`],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `log`,
                ],
                disableRepair: true,
                disableStamina: true,
                visibleTypes: [`planet`, `trail`],
                script: [
                    {
                        message: `You're a natural! A regular flying fish!<br /><br />
            Good job on snagging your first cache. Caches will spawn around the map whenever cargo is dropped, whether intentionally or because... well, you know... someone got blown up.`,
                        advance: `Is it really that dangerous out here?`,
                    },
                ],
                nextStepTrigger: {
                    awaitFrontend: true,
                },
            },
            // ----- ship scan and combat -----
            {
                sightRange: 0.03,
                maxDistanceFromSpawn: 0.03,
                resetView: true,
                shownRooms: [`cockpit`],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `log`,
                ],
                disableRepair: true,
                disableStamina: true,
                visibleTypes: [`planet`, `aiShip`, `trail`],
                script: [
                    {
                        message: `Well it's not THAT dangero— Oh no, what is that...?<br />
            It's an enemy ship! What are they doing here so close to our homeworld?<br /><br />
            Quick, engage the ship scanner!`,
                        advance: `Turn on ship scanner`,
                    },
                ],
                ais: [
                    {
                        loadout: `aiTutorial1`,
                        id: `tutorialAI1` + this.ship.id,
                        level: 1,
                        name: `Enemy Ship`,
                        species: { id: `flamingos` },
                        location: [0.015, 0.01],
                    },
                ],
                nextStepTrigger: {
                    awaitFrontend: true,
                },
            },
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                shownRooms: [`cockpit`],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `log`,
                ],
                highlightPanel: `scanShip`,
                disableRepair: true,
                disableStamina: true,
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                ],
                script: [
                    {
                        message: `Now we can see what we're dealing with.<br />
            Ugh, they're <i>BIRDS</i>! The enemy of all fish!<br /><br />
            It looks like they're outfitted with a weapon but no engine, the fools! They're sitting ducks!`,
                        advance: `Let's take 'em out!`,
                    },
                ],
                nextStepTrigger: {
                    awaitFrontend: true,
                },
            },
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                forceLoadout: `tutorial2`,
                shownRooms: [`cockpit`, `weapons`, `bunk`],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `diagram`,
                    `log`,
                ],
                highlightPanel: `diagram`,
                disableRepair: true,
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                ],
                script: [
                    {
                        message: `I've opened up your ship schematic.<br /><br />
            Tasks are separated by room — if you're in the cockpit you'll pilot the ship, if you're in the bunk you'll sleep, and so on.<br /><br />
            Click on the <b>weapons</b> room to start charging our weapons!`,
                    },
                ],
                nextStepTrigger: {
                    crewLocation: `weapons`,
                },
            },
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                forceCockpitCharge: 0.8,
                shownRooms: [`cockpit`, `weapons`, `bunk`],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `diagram`,
                    `log`,
                    `crewMember`,
                ],
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                ],
                script: [
                    {
                        message: `Your ship will automatically fire when the weapons are charged and a valid target is in range.<br /><br />
            Now's your chance to use what you've learned!<br />
            Switch to the <b>Cockpit</b> to pilot the ship into attack range (closer gives you a higher hit chance), and then charge your weapon in the <b>Weapons Bay</b>. Destroy that fowl craft!`,
                    },
                ],
                nextStepTrigger: {
                    destroyShipId: `tutorialAI1` + this.ship.id,
                },
            },
            // ----- repair -----
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                shownRooms: [
                    `cockpit`,
                    `weapons`,
                    `bunk`,
                    `repair`,
                ],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `diagram`,
                    `log`,
                    `crewMember`,
                    `items`,
                ],
                highlightPanel: `diagram`,
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                    `cache`,
                ],
                script: [
                    {
                        message: `Just like shooting fish in a barrel.`,
                        next: `Uh oh, the ship is damaged.`,
                    },
                    {
                        message: `You're right! Equipment loses repair when used or when hit by an attack. Your ship's health is simply the total of your equipment's HP, so make sure to keep everything ship-shape!<br /><br />
            Go to the repair bay on the ship schematic to start repairing your ship.`,
                    },
                ],
                nextStepTrigger: {
                    crewLocation: `repair`,
                },
            },
            // -----
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                shownRooms: [
                    `cockpit`,
                    `weapons`,
                    `bunk`,
                    `repair`,
                ],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `diagram`,
                    `log`,
                    `crewMember`,
                    `items`,
                ],
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                    `cache`,
                ],
                forceStamina: 0.95,
                script: [
                    {
                        message: `Well, that was a productive venture! You've gained some XP in piloting, munitions, and mechanics for all the work you put in.<br />
            You'll get faster and more efficient at various tasks around the ship by leveling up your skills.`,
                        next: `Sounds good.`,
                    },
                    {
                        message: `Adventuring can really take it out of you. If you look, you'll see that you've lost some stamina from all the hard work.`,
                        next: `Ah, so I have!`,
                    },
                    {
                        message: `Click on the <b>Bunk</b> in the ship schematic to move there and get some rest.`,
                    },
                ],
                nextStepTrigger: {
                    crewLocation: `bunk`,
                },
            },
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                forceCockpitCharge: 0.7,
                resetView: true,
                shownRooms: [
                    `cockpit`,
                    `weapons`,
                    `bunk`,
                    `repair`,
                ],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `diagram`,
                    `log`,
                    `crewMember`,
                    `items`,
                ],
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                    `cache`,
                ],
                script: [
                    {
                        message: `Excellent. Once you're ready, let's head planetside to check out what's happening on the surface!`,
                    },
                ],
                nextStepTrigger: {
                    location: {
                        location: [0, 0],
                        label: `back home`,
                    },
                },
            },
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                shownRooms: [
                    `cockpit`,
                    `weapons`,
                    `bunk`,
                    `repair`,
                ],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `diagram`,
                    `log`,
                    `crewMember`,
                    `planet`,
                    `items`,
                ],
                highlightPanel: `planet`,
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                    `cache`,
                ],
                script: [
                    {
                        message: `Wow, they've got a lot of things for sale!`,
                        next: `Cool!`,
                    },
                    {
                        message: `You can buy and sell your personal cargo here.<br />
            The captain can also buy and sell equipment for the ship. <br />
            Different planets will have different things for sale, so always be sure to check out what's on offer when you land on a new planet.`,
                        advance: `Got it!`,
                    },
                ],
                nextStepTrigger: {
                    awaitFrontend: true,
                },
            },
            // ----------
            {
                sightRange: 0.03,
                scanRange: 0.02,
                maxDistanceFromSpawn: 0.03,
                forceCockpitCharge: 1,
                shownRooms: [
                    `cockpit`,
                    `weapons`,
                    `bunk`,
                    `repair`,
                ],
                shownPanels: [
                    `mapZoom`,
                    `map`,
                    `room`,
                    `inventory`,
                    `ship`,
                    `scanShip`,
                    `diagram`,
                    `log`,
                    `crewMember`,
                    `planet`,
                    `items`,
                ],
                visibleTypes: [
                    `planet`,
                    `aiShip`,
                    `attackRemnant`,
                    `trail`,
                    `cache`,
                ],
                script: [
                    {
                        message: `There's a lot more to learn about — broadcasting, factions, passives, and more — but I think you're ready to start exploring!`,
                        next: `Heck yeah I am!`,
                    },
                    {
                        message: `The real journey starts here. Will your ship be traders? Pirates? Explorers? Peacekeepers? Time will tell.`,
                        advance: `Get started`,
                    },
                ],
                nextStepTrigger: {
                    awaitFrontend: true,
                },
            },
        ];
    }
    tick() {
        if (!this.currentStep)
            return;
        // ----- advance step if all requirements have been met -----
        if (this.currentStep.nextStepTrigger.awaitFrontend)
            return;
        let shouldAdvance = true;
        if (this.targetLocation)
            shouldAdvance =
                shouldAdvance &&
                    dist_1.default.distance(this.ship.location, this.targetLocation.location) <= this.ship.game.settings.arrivalThreshold;
        if (this.currentStep.nextStepTrigger.gainStaminaTo)
            shouldAdvance =
                shouldAdvance &&
                    Boolean(this.ship.crewMembers.find((cm) => cm.stamina >
                        this.currentStep.nextStepTrigger
                            .gainStaminaTo));
        if (this.currentStep.nextStepTrigger.destroyShipId)
            shouldAdvance =
                shouldAdvance &&
                    !this.ship.game.aiShips.find((s) => s.id ===
                        this.currentStep.nextStepTrigger.destroyShipId);
        if (this.currentStep.nextStepTrigger.crewLocation)
            shouldAdvance =
                shouldAdvance &&
                    Boolean(this.ship.crewMembers.find((cm) => cm.location ===
                        this.currentStep.nextStepTrigger
                            .crewLocation));
        if (this.currentStep.nextStepTrigger.useCrewCreditsTo)
            shouldAdvance =
                shouldAdvance &&
                    Boolean(this.ship.crewMembers.find((cm) => cm.credits <=
                        this.currentStep.nextStepTrigger
                            .useCrewCreditsTo));
        if (this.currentStep.nextStepTrigger.useCommonCreditsTo)
            shouldAdvance =
                shouldAdvance &&
                    this.ship.commonCredits <=
                        this.currentStep.nextStepTrigger
                            .useCommonCreditsTo;
        if (this.currentStep.nextStepTrigger.stopped)
            shouldAdvance =
                shouldAdvance &&
                    this.ship.velocity[0] < 0.0001 &&
                    this.ship.velocity[1] < 0.0001;
        if (shouldAdvance)
            this.advanceStep();
        this.ship.updateSightAndScanRadius();
    }
    advanceStep() {
        this.step++;
        this.currentStep = this.steps[this.step];
        if (!this.currentStep)
            return this.done();
        dist_1.default.log(`Tutorial advancing to step ${this.step} for ${this.ship.name}`);
        // apply loadout
        if (this.currentStep.forceLoadout) {
            this.ship.equipLoadout(this.currentStep.forceLoadout, true);
        }
        this.ship.updateSightAndScanRadius();
        if (this.currentStep.resetView)
            io_1.default.to(`ship:${this.ship.id}`).emit(`ship:resetView`);
        // move to step location
        if (this.currentStep.forceLocation) {
            this.ship.previousLocations = [];
            this.ship.move([
                this.baseLocation[0] +
                    this.currentStep.forceLocation[0],
                this.baseLocation[1] +
                    this.currentStep.forceLocation[1],
            ]);
        }
        // spawn caches
        if (this.currentStep.caches) {
            for (let k of this.currentStep.caches) {
                this.ship.game.addCache({
                    ...k,
                    location: [
                        this.baseLocation[0] + k.location[0],
                        this.baseLocation[1] + k.location[1],
                    ],
                    onlyVisibleToShipId: this.ship.id,
                });
            }
        }
        // spawn ais
        if (this.currentStep.ais) {
            for (let s of this.currentStep.ais) {
                this.ship.game.addAIShip({
                    ...s,
                    location: s.location
                        ? [
                            this.baseLocation[0] + s.location[0],
                            this.baseLocation[1] + s.location[1],
                        ]
                        : [...this.baseLocation],
                    onlyVisibleToShipId: this.ship.id,
                });
            }
        }
        // crew location
        if (this.currentStep.forceCrewLocation)
            this.ship.crewMembers.forEach((cm) => {
                cm.location = this.currentStep.forceCrewLocation;
                cm.toUpdate.location = cm.location;
            });
        // crew stamina
        if (this.currentStep.forceStamina !== undefined)
            this.ship.crewMembers.forEach((cm) => {
                cm.stamina = this.currentStep.forceStamina;
                cm.toUpdate.stamina = cm.stamina;
            });
        // crew cockpit charge
        if (this.currentStep.forceCockpitCharge !== undefined)
            this.ship.crewMembers.forEach((cm) => {
                cm.cockpitCharge =
                    this.currentStep.forceCockpitCharge;
                cm.toUpdate.cockpitCharge = cm.cockpitCharge;
            });
        // rooms
        if (this.currentStep.shownRooms)
            for (let r of this.currentStep.shownRooms)
                this.ship.addRoom(r);
        // target locations
        if (this.currentStep.nextStepTrigger.location)
            this.targetLocation = {
                location: [
                    this.baseLocation[0] +
                        this.currentStep.nextStepTrigger.location
                            .location[0],
                    this.baseLocation[1] +
                        this.currentStep.nextStepTrigger.location
                            .location[1],
                ],
                label: this.currentStep.nextStepTrigger.location.label,
                color: this.currentStep.nextStepTrigger.location.color,
            };
        else
            this.targetLocation = undefined;
        // set common credits
        if (this.currentStep.forceCommonCredits) {
            this.ship.commonCredits =
                this.currentStep.forceCommonCredits;
            this.ship.toUpdate.commonCredits =
                this.ship.commonCredits;
        }
        // show panels on frontend
        this.ship.recalculateShownPanels();
        // setTimeout(() => {
        // timeout to come after any tick-related logs but was breaking if the player went too fast
        // // if (!m.channel) this.ship.logEntry(m.message)
        for (let m of this.currentStep.script)
            if (m.channel) {
                const mainShip = this.ship.game.humanShips.find((s) => s.id === this.ship.crewMembers[0]?.mainShipId);
                // only send messages to the discord server if it's the ship's very first tutorial
                if (this.ship.crewMembers[0]?.mainShipId &&
                    (!mainShip || mainShip.getStat(`tutorials`) === 0))
                    io_1.default.emit(`ship:message`, this.ship.crewMembers[0].mainShipId, m.message, m.channel);
            }
        // }, c.tickInterval)
        this.ship.toUpdate.tutorial = {
            currentStep: this.currentStep,
            targetLocation: this.targetLocation,
        };
    }
    static endMessages(ship) {
        setTimeout(() => {
            ship.logEntry([
                `Good luck out there! If you have questions about the game, check out the`,
                { text: `How To Play`, url: `/howtoplay` },
                `page!`,
            ], `high`);
            io_1.default.emit(`ship:message`, ship.id, `Use this channel to broadcast to and receive messages from nearby ships!`, `broadcast`);
        }, dist_1.default.tickInterval);
        ship.addHeaderBackground(dist_1.default.capitalize(ship.faction.id) + ` Faction 1`, `joining the ${dist_1.default.capitalize(ship.faction.id)} faction`);
        ship.addHeaderBackground(dist_1.default.capitalize(ship.faction.id) + ` Faction 2`, `joining the ${dist_1.default.capitalize(ship.faction.id)} faction`);
        ship.addTagline(`Alpha Tester`, `helping to test ${dist_1.default.gameName}`);
        if (ship.planet)
            ship.planet.shipsAt
                .filter((s) => s.faction?.color === ship.faction?.color)
                .forEach((s) => {
                if (s === ship || !s.planet)
                    return;
                s.logEntry([
                    {
                        text: ship.name,
                        color: ship.faction.color,
                        tooltipData: ship.toReference(),
                    },
                    `has joined the game, starting out from`,
                    {
                        text: s.planet.name,
                        color: s.planet.color,
                        tooltipData: s.planet.toReference(),
                    },
                    `&nospace!`,
                ]);
            });
    }
    done(skip = false) {
        dist_1.default.log(`Tutorial ${skip ? `skipped` : `complete`} for ${this.ship.name}`);
        const mainShip = this.ship.game.humanShips.find((s) => s.id === this.ship.crewMembers[0]?.mainShipId);
        if (!mainShip) {
            this.cleanUp();
            return;
        }
        io_1.default.to(`ship:${this.ship.id}`).emit(`ship:forwardTo`, mainShip.id);
        mainShip.addStat(`tutorials`, 1);
        if (mainShip.getStat(`tutorials`) === 1)
            Tutorial.endMessages(mainShip);
        this.cleanUp();
    }
    async cleanUp() {
        dist_1.default.log(`Cleaning up after tutorial...`);
        // c.log(
        //   this.ship.game.caches.length,
        //   this.ship.game.caches.filter(
        //     (k) => k.onlyVisibleToShipId,
        //   ),
        //   this.ship.game.caches.filter(
        //     (k) => k.onlyVisibleToShipId === this.ship.id,
        //   ),
        // )
        this.ship.game.caches
            .filter((k) => k.onlyVisibleToShipId === this.ship.id)
            .forEach((k) => {
            // c.log(`attempting to remove cache`, k)
            this.ship.game.removeCache(k);
        });
        this.ship.game.attackRemnants
            .filter((a) => a.onlyVisibleToShipId === this.ship.id)
            .forEach((a) => {
            this.ship.game.removeAttackRemnant(a);
        });
        this.ship.game.aiShips
            .filter((s) => s.onlyVisibleToShipId === this.ship.id)
            .forEach((s) => {
            this.ship.game.removeShip(s);
        });
        const mainShip = this.ship.game.humanShips.find((s) => s.id === this.ship.crewMembers[0]?.mainShipId);
        if (!mainShip) {
            dist_1.default.log(`red`, `Failed to find main ship for crew member exiting tutorial!`);
        }
        else {
            const mainCrewMember = mainShip.crewMembers.find((cm) => cm.id === this.ship.crewMembers[0]?.id);
            if (!mainCrewMember) {
                dist_1.default.log(`red`, `Failed to find main crew member exiting tutorial!`);
            }
            else {
                mainCrewMember.tutorialShipId = undefined;
                mainCrewMember.toUpdate.tutorialShipId = undefined;
            }
        }
        this.ship.tutorial = undefined;
        if (this.ship.game.ships.includes(this.ship))
            await this.ship.game.removeShip(this.ship);
    }
}
exports.Tutorial = Tutorial;
//# sourceMappingURL=Tutorial.js.map