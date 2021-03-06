import c from '../../../../../../common/dist'
import type { HumanShip } from './HumanShip'
import type { CrewMember } from '../../CrewMember/CrewMember'

interface BaseTutorialData {
  step: number
  baseLocation?: CoordinatePair
}
interface TutorialStepData {
  shownRooms: CrewLocation[]
  forceCrewLocation?: CrewLocation
  shownPanels: FrontendPanelType[]
  highlightPanel?: FrontendPanelType
  maxDistanceFromSpawn?: number
  sightRange: number
  scanRange?: number
  resetView?: boolean
  forceCockpitCharge?: number
  forceStamina?: number
  disableStamina?: true
  disableRepair?: true
  script: {
    message: string
    channel?: GameChannelType
    next?: string
    advance?: string
    notify?: boolean
    isGood?: boolean
  }[]
  forceLocation?: CoordinatePair
  forceCommonCredits?: number
  forceLoadout?: LoadoutId
  visibleTypes: (
    | `humanShip`
    | `aiShip`
    | `planet`
    | `cache`
    | `attackRemnant`
    | `trail`
  )[]
  caches?: BaseCacheData[]
  ais?: BaseShipData[]
  nextStepTrigger: {
    location?: TargetLocation
    crewLocation?: CrewLocation
    gainStaminaTo?: number
    useCrewCreditsTo?: number
    useCommonCreditsTo?: number
    destroyShipId?: string
    awaitFrontend?: boolean
    stopped?: boolean
  }
}

export class Tutorial {
  step: number = 0
  steps: TutorialStepData[] = []
  baseLocation: CoordinatePair = [0, 0]
  currentStep: TutorialStepData
  ship: HumanShip
  targetLocation?: TargetLocation

  static async putCrewMemberInTutorial(crewMember: CrewMember) {
    // c.log(
    //   `gray`,
    //   `Spawning tutorial ship for crew member ${crewMember.id} on ${crewMember.ship.name}`,
    // )
    const tutorialShip = await crewMember.ship.game?.addHumanShip({
      name: crewMember.ship.name,
      tutorial: { step: -1 },
      id: `tutorial-${crewMember.ship.id}-${crewMember.id}`,
      guildId: crewMember.ship.guildId,
    })
    if (!tutorialShip) return
    await tutorialShip.addCrewMember({
      name: crewMember.name,
      id: crewMember.id,
      mainShipId: crewMember.ship.id,
      speciesId: `angelfish`,
    })
    crewMember.tutorialShipId = tutorialShip.id
    crewMember.toUpdate.tutorialShipId = crewMember.tutorialShipId

    await crewMember.ship.game?.db?.ship.addOrUpdateInDb(crewMember.ship)
    return tutorialShip
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
        visibleTypes: [`planet`],
        script: [
          {
            message: `Welcome to ${
              c.gameName
            }! To get started, log in at ${c.frontendUrl.replace(
              /\/s$/gi,
              ``,
            )}`,
            channel: `alert`,
            notify: true,
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
            message: `Welcome to ${c.gameName}!<br />
            This is a game about exploring space in a ship crewed by your Discord server's members.<br /><br />
            Get into huge-scale battles with rival guilds of real people!<br />
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
            They haven't changed at all ??? they'll hunt down any fish they get their beady little eyes on. Steer clear of them if you can!<br /><br />
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
        This is what's near us. See that big dot? That's the planet we're at!`,
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
            message: `Oho! That's clarified things a bit. We can now see for a few million kilometers, which is a pretty long way, galactically speaking.`,
            next: `Cool.`,
          },
          {
            message: `You can click, pan, and scroll to move and zoom the big map to get more perspective.<br />
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
            contents: [{ amount: 1000, id: `credits` }],
            location: [0.015, 0.005],
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
            message:
              `While you're in the <b>cockpit</b>, you will slowly charge up thrust (unique to you).<br /><br />
            Click on the big map to set a target destination. ` +
              // Based on your engines, you can manually or passively apply thrust to the ship by being in the cockpit. Your current engine only has manual thrust.
              `<br /><br />
            Click and hold the <b>Thrust</b> button in the cockpit pane to use your charged thrust toward your chosen direction!<br />
            Since we're in space, once you start moving in a direction, you'll keep floating that way! That means that even a small ship can generate a huge amount of speed over time.<br /><br />
            Try to <b>move the ship to the cache we found!</b>`,
            // <br /><br />
            // <hr style="opacity: .1;" />`
            // <div class="sub">It might look like the ship isn't moving, but it takes time to build speed ??? zoom in to see the thrust accumulate!</div>`,
          },
        ],
        nextStepTrigger: {
          location: {
            location: [0.015, 0.005],
            label: `cache`,
          },
        },
      },
      {
        sightRange: 0.03,
        maxDistanceFromSpawn: 0.03,
        shownRooms: [`cockpit`],
        shownPanels: [`mapZoom`, `map`, `room`, `inventory`, `ship`, `log`],
        highlightPanel: `inventory`,
        disableRepair: true,
        disableStamina: true,
        forceCockpitCharge: 0.85,
        visibleTypes: [`planet`, `trail`],
        script: [
          {
            message: `Awesome, we got it! <br /><br/>
            There were some ????${c.baseCurrencyPlural} inside! ????${c.capitalize(
              c.baseCurrencyPlural,
            )} are how you pay for cargo and equipment. Every crew member has their own stock of cargo and ????${
              c.baseCurrencyPlural
            }.<br /><br/>
            This cache was close by, but most things in space are <i>astronomically</i> far apart. Don't be surprised if it sometimes takes a day or more to reach your next destination.`,
            advance: `Got it.`,
          },
        ],
        nextStepTrigger: { awaitFrontend: true },
      },
      {
        sightRange: 0.03,
        maxDistanceFromSpawn: 0.03,
        shownRooms: [`cockpit`],
        shownPanels: [`mapZoom`, `map`, `room`, `inventory`, `ship`, `log`],
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
        shownPanels: [`mapZoom`, `map`, `room`, `inventory`, `ship`, `log`],
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
        shownPanels: [`mapZoom`, `map`, `room`, `inventory`, `ship`, `log`],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`, `aiShip`, `trail`],
        script: [
          {
            message: `Well it's not THAT dangero??? Oh no, what is that...?<br />
            It's an enemy ship! What are they doing here so close to our homeworld?<br /><br />
            Quick, engage the ship scanner!`,
            advance: `Turn on ship scanner`,
          },
        ],
        ais: [
          {
            loadout: `aiTutorial1`,
            id: `tutorialAI1` + this.ship.id,
            guildId: `fowl`,
            level: 1,
            name: `Chicken`,
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
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`],
        script: [
          {
            message: `Now we can see what we're dealing with.<br />
            Ugh, they're <i>BIRDS!</i> The enemy of all fish!<br /><br />
            It looks like they're outfitted with only the most basic equipment! They're sitting ducks!`,
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
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`],
        script: [
          {
            message: `I've opened up your ship schematic.<br /><br />
            Tasks are separated by room ??? if you're in the cockpit you'll pilot the ship, if you're in the bunk you'll sleep, and so on.<br /><br />
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
        ],
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`],
        script: [
          {
            message: `Your ship will automatically fire when the weapons are charged, your tactics are set, and a valid target is in range.<br /><br />
            Now's your chance to use what you've learned!<br />
            Switch to the <b>Cockpit</b> to pilot the ship into attack range (closer gives you a higher hit chance), and then charge your weapon in the <b>Weapons Bay</b>. Destroy that fowl craft!
            <br />
            <hr style="opacity: .1;" />
            <div class="sub">Don't forget to set your tactic to <b>Aggressive</b> to attack any ship in range!</div>`,
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
        shownRooms: [`cockpit`, `weapons`, `bunk`, `repair`],
        shownPanels: [
          `mapZoom`,
          `map`,
          `room`,
          `inventory`,
          `ship`,
          `scanShip`,
          `diagram`,
          `log`,
          `items`,
        ],
        highlightPanel: `diagram`,
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`, `cache`],
        script: [
          {
            message: `Just like shooting fish in a barrel.`,
            next: `Uh oh, the ship is damaged.`,
          },
          {
            message: `You're right! Equipment loses repair when used or when hit by an attack. Your ship's health is simply the total of your equipment's HP, so make sure to keep everything ship-shape!<br /><br />
            Go to the <b>Repair Bay</b> on the ship schematic to start repairing your ship.`,
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
        shownRooms: [`cockpit`, `weapons`, `bunk`, `repair`],
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
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`, `cache`],
        highlightPanel: `crewMember`,
        forceStamina: 0.95,
        script: [
          {
            message: `Well, that was a productive venture! You've gained some XP in strength and dexterity for all the work you put in.<br />
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
        shownRooms: [`cockpit`, `weapons`, `bunk`, `repair`],
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
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`, `cache`],
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
        shownRooms: [`cockpit`, `weapons`, `bunk`, `repair`],
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
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`, `cache`],
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
        shownRooms: [`cockpit`, `weapons`, `bunk`, `repair`],
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
        visibleTypes: [`planet`, `aiShip`, `attackRemnant`, `trail`, `cache`],
        script: [
          {
            message: `There's a lot more to learn about ??? broadcasting, guilds, passives, mining, and more ??? but I think you're ready to start exploring!`,
            next: `Heck yeah I am!`,
          },
          {
            message: `The real journey starts here. Good luck!`,
            advance: `Start Game`,
          },
        ],
        nextStepTrigger: {
          awaitFrontend: true,
        },
      },
    ]
  }

  constructor(data: BaseTutorialData, ship: HumanShip) {
    this.ship = ship

    this.ship.guildId = undefined

    this.initializeSteps()
    this.step = Math.max(-1, data.step - 1)
    this.baseLocation =
      data.baseLocation ||
      ([
        ...(this.ship.game?.getHomeworld(this.ship.guildId)?.location ||
          c.randomFromArray(
            (this.ship.game?.planets || []).filter((p) => p.homeworld),
          )?.location || [0, 0]),
      ].map(
        (l) => l,
        //  +
        // (this.ship.game?.settings.arrivalThreshold ||
        //   c.defaultGameSettings.arrivalThreshold) *
        //   (Math.random() - 0.5),
      ) as CoordinatePair)
    this.currentStep = this.steps[this.step]
    if (this.step === -1) {
      // * timeout to give a chance to initialize the crew member in the ship and save it, THEN start
      setTimeout(async () => {
        let retries = 0
        while (this.ship.crewMembers.length === 0 && retries < 100) {
          await c.sleep(100)
          retries++
        }
        this.advanceStep()

        // * clear any already seen planets, etc
        while (this.ship.seenPlanets.length) this.ship.seenPlanets.pop()
        this.ship.toUpdate.seenPlanets = this.ship.seenPlanets
        while (this.ship.seenLandmarks.length) this.ship.seenLandmarks.pop()
        this.ship.toUpdate.seenLandmarks = this.ship.seenLandmarks
        while (this.ship.log.length) this.ship.log.pop()
        this.ship.toUpdate.log = this.ship.log
      }, 1)
      this.currentStep = this.steps[this.step]
    }
  }

  tick() {
    if (!this.currentStep) return

    // ----- advance step if all requirements have been met -----
    if (this.currentStep.nextStepTrigger.awaitFrontend) return

    let shouldAdvance = true

    if (this.targetLocation)
      shouldAdvance =
        shouldAdvance &&
        c.distance(this.ship.location, this.targetLocation.location) <=
          (this.ship.game?.settings.arrivalThreshold ||
            c.defaultGameSettings.arrivalThreshold)

    if (this.currentStep.nextStepTrigger.gainStaminaTo)
      shouldAdvance =
        shouldAdvance &&
        Boolean(
          this.ship.crewMembers.find(
            (cm) =>
              cm.stamina > this.currentStep.nextStepTrigger.gainStaminaTo!,
          ),
        )

    if (this.currentStep.nextStepTrigger.destroyShipId)
      shouldAdvance =
        shouldAdvance &&
        !this.ship.game?.aiShips.find(
          (s) => s.id === this.currentStep.nextStepTrigger.destroyShipId,
        )

    if (this.currentStep.nextStepTrigger.crewLocation)
      shouldAdvance =
        shouldAdvance &&
        Boolean(
          this.ship.crewMembers.find(
            (cm) =>
              cm.location === this.currentStep.nextStepTrigger.crewLocation!,
          ),
        )

    if (this.currentStep.nextStepTrigger.useCrewCreditsTo)
      shouldAdvance =
        shouldAdvance &&
        Boolean(
          this.ship.crewMembers.find(
            (cm) =>
              cm.credits <= this.currentStep.nextStepTrigger.useCrewCreditsTo!,
          ),
        )

    if (this.currentStep.nextStepTrigger.useCommonCreditsTo)
      shouldAdvance =
        shouldAdvance &&
        this.ship.commonCredits <=
          this.currentStep.nextStepTrigger.useCommonCreditsTo

    if (this.currentStep.nextStepTrigger.stopped)
      shouldAdvance =
        shouldAdvance &&
        this.ship.velocity[0] < 0.0001 &&
        this.ship.velocity[1] < 0.0001

    if (shouldAdvance) this.advanceStep()
    this.ship.updateSightAndScanRadius()
  }

  advanceStep() {
    this.step++
    this.currentStep = this.steps[this.step]
    if (!this.currentStep) return this.done()

    // c.log(
    //   `Tutorial advancing to step ${this.step} for ${this.ship.name}`,
    // )

    // apply loadout
    if (this.currentStep.forceLoadout) {
      this.ship.equipLoadout(this.currentStep.forceLoadout, true)
    }

    this.ship.updateSightAndScanRadius()

    if (this.currentStep.resetView)
      this.ship.game?.io.to(`ship:${this.ship.id}`).emit(`ship:resetView`)

    // move to step location
    if (this.currentStep.forceLocation) {
      this.ship.previousLocations = []
      this.ship.move([
        this.baseLocation[0] + this.currentStep.forceLocation[0],
        this.baseLocation[1] + this.currentStep.forceLocation[1],
      ])
    }

    // spawn caches
    if (this.currentStep.caches) {
      for (let k of this.currentStep.caches) {
        this.ship.game?.addCache({
          ...k,
          location: [
            this.baseLocation[0] + k.location[0],
            this.baseLocation[1] + k.location[1],
          ],
          onlyVisibleToShipId: this.ship.id,
        })
      }
    }

    // spawn ais
    if (this.currentStep.ais) {
      for (let s of this.currentStep.ais) {
        this.ship.game?.addAIShip({
          ...s,
          location: s.location
            ? [
                this.baseLocation[0] + s.location[0],
                this.baseLocation[1] + s.location[1],
              ]
            : [...this.baseLocation],
          speciesId: `chickens`,
          onlyVisibleToShipId: this.ship.id,
        })
      }
    }

    // crew location
    if (this.currentStep.forceCrewLocation)
      this.ship.crewMembers.forEach((cm) => {
        cm.location = this.currentStep.forceCrewLocation!
        cm.toUpdate.location = cm.location
      })

    // crew stamina
    if (this.currentStep.forceStamina !== undefined)
      this.ship.crewMembers.forEach((cm) => {
        cm.stamina = cm.maxStamina * this.currentStep.forceStamina!
        cm.toUpdate.stamina = cm.stamina
      })

    // crew cockpit charge
    if (this.currentStep.forceCockpitCharge !== undefined)
      this.ship.crewMembers.forEach((cm) => {
        cm.cockpitCharge = this.currentStep.forceCockpitCharge!
        cm.toUpdate.cockpitCharge = cm.cockpitCharge
      })

    // rooms
    if (this.currentStep.shownRooms)
      for (let r of this.currentStep.shownRooms) this.ship.addRoom(r)

    // target locations
    if (this.currentStep.nextStepTrigger.location)
      this.targetLocation = {
        location: [
          this.baseLocation[0] +
            this.currentStep.nextStepTrigger.location.location[0],
          this.baseLocation[1] +
            this.currentStep.nextStepTrigger.location.location[1],
        ],
        label: this.currentStep.nextStepTrigger.location.label,
        color: this.currentStep.nextStepTrigger.location.color,
      }
    else this.targetLocation = undefined

    // set common credits
    if (this.currentStep.forceCommonCredits) {
      this.ship.commonCredits = this.currentStep.forceCommonCredits
      this.ship.toUpdate.commonCredits = this.ship.commonCredits
    }

    // show panels on frontend
    this.ship.recalculateShownPanels()

    // setTimeout(() => {
    // timeout to come after any tick-related logs but was breaking if the player went too fast
    // // if (!m.channel) this.ship.logEntry(m.message)
    for (let m of this.currentStep.script)
      if (m.channel) {
        const mainShip = this.ship.game?.humanShips.find(
          (s) => s.id === this.ship.crewMembers[0]?.mainShipId,
        )
        // only send messages to the discord server if it's the ship's very first tutorial
        if (
          this.ship.crewMembers[0]?.mainShipId &&
          (!mainShip || mainShip.getStat(`tutorials`) === 0)
        )
          this.ship.game?.io.emit(
            `ship:message`,
            this.ship.crewMembers[0].mainShipId,
            m.message,
            m.channel,
            m.notify,
          )
      }
    // }, c.tickInterval)

    this.ship.toUpdate.tutorial = {
      currentStep: this.currentStep,
      targetLocation: this.targetLocation,
    }
  }

  static endMessages(ship: HumanShip) {
    setTimeout(() => {
      ship.logEntry(
        [
          `Good luck out there! If you have questions about the game, check out the`,
          { text: `How To Play`, url: `/howtoplay` },
          `page!`,
        ],
        `high`,
        `party`,
        true,
      )
      ship.game?.io.emit(
        `ship:message`,
        ship.id,
        `Use this channel to broadcast to and receive messages from nearby ships!`,
        `broadcast`,
      )
    }, c.tickInterval)

    ship.checkAchievements(`guild`)
    ship.addAchievement(`alphaTester`)

    if (ship.planet)
      ship.planet.shipsAt
        .filter(
          (s) =>
            (s.guildId && c.guilds[s.guildId].color) ===
            (ship.guildId && c.guilds[ship.guildId].color),
        )
        .forEach((s) => {
          if (s === ship || !s.planet) return
          s.logEntry(
            [
              {
                text: ship.name,
                color: ship.guildId && c.guilds[ship.guildId].color,
                tooltipData: ship.toReference() as any,
              },
              `joined the game.`,
            ],
            `low`,
            `party`,
          )
        })
  }

  done(skip = false) {
    // c.log(
    //   `Tutorial ${skip ? `skipped` : `complete`} for ${
    //     this.ship.name
    //   }`,
    // )

    const mainShip = this.ship.game?.humanShips.find(
      (s) => s.id === this.ship.crewMembers[0]?.mainShipId,
    )
    if (!mainShip) {
      this.cleanUp()
      return
    }

    this.ship.game?.io
      .to(`ship:${this.ship.id}`)
      .emit(`ship:forwardTo`, mainShip.id)

    mainShip.addStat(`tutorials`, 1)

    if (mainShip.getStat(`tutorials`) === 1) Tutorial.endMessages(mainShip)

    this.cleanUp()
  }

  async cleanUp() {
    // c.log(`Cleaning up after tutorial...`)
    // c.log(
    //   this.ship.game.caches.length,
    //   this.ship.game.caches.filter(
    //     (k) => k.onlyVisibleToShipId,
    //   ),
    //   this.ship.game.caches.filter(
    //     (k) => k.onlyVisibleToShipId === this.ship.id,
    //   ),
    // )
    this.ship.game?.caches
      .filter((k) => k.onlyVisibleToShipId === this.ship.id)
      .forEach((k) => {
        // c.log(`attempting to remove cache`, k)
        this.ship.game?.removeCache(k)
      })
    this.ship.game?.attackRemnants
      .filter((a) => a.onlyVisibleToShipId === this.ship.id)
      .forEach((a) => {
        this.ship.game?.removeAttackRemnant(a)
      })
    this.ship.game?.aiShips
      .filter((s) => s.onlyVisibleToShipId === this.ship.id)
      .forEach((s) => {
        this.ship.game?.removeShip(s)
      })

    const mainShip = this.ship.game?.humanShips.find(
      (s) => s.id === this.ship.crewMembers[0]?.mainShipId,
    )
    if (!mainShip) {
      c.log(`red`, `Failed to find main ship for crew member exiting tutorial!`)
    } else {
      const mainCrewMember = mainShip.crewMembers.find(
        (cm) => cm.id === this.ship.crewMembers[0]?.id,
      )
      if (!mainCrewMember) {
        c.log(`red`, `Failed to find main crew member exiting tutorial!`)
      } else {
        mainCrewMember.tutorialShipId = undefined
        mainCrewMember.toUpdate.tutorialShipId = undefined
      }
    }

    this.ship.tutorial = undefined

    if (this.ship.game?.ships.includes(this.ship))
      await this.ship.game?.removeShip(this.ship)
  }
}
