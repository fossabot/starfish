import c from '../../../../../../common/dist'
import io from '../../../../server/io'
import type { HumanShip } from '../HumanShip'

interface BaseTutorialData {
  step: number
}
interface TutorialStepData {
  shownRooms: CrewLocation[]
  forceCrewLocation?: CrewLocation
  shownPanels: FrontendPanelType[]
  sightRange: number
  scanRange?: number
  forceStamina?: number
  disableStamina?: true
  disableRepair?: true
  script: {
    message: string
    channel?: GameChannelType
    next?: string
    advance?: string
  }[]
  forceLocation?: CoordinatePair
  forceCommonCredits?: number
  forceLoadout?: LoadoutName
  visibleTypes: (
    | `ship`
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
  }
}

export class Tutorial {
  step: number = 0

  steps: TutorialStepData[] = []
  baseLocation: CoordinatePair = [0, 0]
  currentStep: TutorialStepData
  ship: HumanShip
  targetLocation?: TargetLocation

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
            message: `Welcome to ${c.GAME_NAME}! To get started, log in at ${c.frontendUrl}`,
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
            message: `It's dark in here. Let's turn the lights on!`,
            advance: `Turn on Scanner`,
          },
        ],
        nextStepTrigger: { awaitFrontend: true },
      },
      {
        sightRange: 0.03,
        shownRooms: [],
        shownPanels: [`mapZoom`, `ship`],
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
            contents: [{ amount: 10, type: `credits` }],
            location: [0.02, 0],
          },
        ],
        nextStepTrigger: {
          awaitFrontend: true,
        },
      },
      {
        sightRange: 0.03,
        shownRooms: [`cockpit`],
        forceCrewLocation: `cockpit`,
        shownPanels: [`mapZoom`, `map`, `room`, `ship`],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`, `cache`],
        script: [
          {
            message: `While you're in the <b>cockpit</b>, you can click on the big map to set a destination. Try to move the ship to the cache we found!`,
          },
        ],
        nextStepTrigger: {
          location: {
            coordinates: [0.02, 0],
            label: `cache`,
          },
        },
      },
      {
        sightRange: 0.03,
        shownRooms: [`cockpit`],
        shownPanels: [
          `mapZoom`,
          `map`,
          `room`,
          `inventory`,
          `ship`,
        ],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`],
        script: [
          {
            message: `Awesome, we got it! <br /><br/>
            There were some 💳credits inside! Credits are how you pay for cargo and equipment. Every crew member has their own stock of cargo and credits.<br /><br/>
            This one was close by, but most things in space are <i>astronomically</i> far apart. Don't be surprised if it sometimes takes a day or more to reach your next destination.<br /><br />
            Caches will spawn around the map whenever cargo is dropped, whether intentionally or because... well, you know... someone got blown up.`,
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
        shownRooms: [`cockpit`],
        shownPanels: [
          `mapZoom`,
          `map`,
          `room`,
          `inventory`,
          `ship`,
        ],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`, `ship`],
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
            name: `Robot Ship`,
            species: { id: `robots` },
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
        shownRooms: [`cockpit`],
        shownPanels: [
          `mapZoom`,
          `map`,
          `room`,
          `inventory`,
          `ship`,
          `scanShip`,
        ],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`, `ship`, `attackRemnant`],
        script: [
          {
            message: `Now we can see what we're dealing with. It looks like they're outfitted with a weapon but no engine. They're a sitting duck!`,
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
        ],
        disableRepair: true,
        visibleTypes: [`planet`, `ship`, `attackRemnant`],
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
        visibleTypes: [`planet`, `ship`, `attackRemnant`],
        script: [
          {
            message: `Depending on your chosen tactic, your ship will automatically fight. Change your tactic to <b>aggressive</b> to attack as soon as your weapons are charged. Switch to the Cockpit to pilot the ship into attack range (closer gives you a higher hit chance), and then charge your weapon in the Weapons Bay. Destroy the enemy craft!<br /><br />
            By the way, you can't attack or be attacked when you're on a planet.<br/><br/>
            (If you want to fly and shoot at the same time, you'll need to recruit more crew members to your ship.)`,
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
          `ship`,
          `attackRemnant`,
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
          `ship`,
          `attackRemnant`,
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
          `ship`,
          `attackRemnant`,
          `cache`,
        ],
        script: [
          {
            message: `Excellent. Once you're ready, let's head planetside to check out what's happening on the surface!`,
          },
        ],
        nextStepTrigger: {
          location: {
            coordinates: [0, 0],
            label: `back home`,
          },
        },
      },

      {
        sightRange: 0.03,
        scanRange: 0.02,
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
          `ship`,
          `attackRemnant`,
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
          `ship`,
          `attackRemnant`,
          `cache`,
        ],
        script: [
          {
            message: `There's a lot more to learn about — broadcasting, factions, passives, and more — but I think you're ready to start exploring!`,
            next: `Heck yeah I am!`,
          },
          {
            message: `The real journey starts here. Will your ship be traders? Pirates? Explorers? Peacekeepers? Time will tell.`,
            advance: `<< Get started >>`,
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
    this.initializeSteps()
    this.step = data.step
    this.baseLocation = [
      ...(this.ship.faction.homeworld?.location || [0, 0]),
    ]
    if (this.step === -1) this.advanceStep()
    this.currentStep = this.steps[this.step]
  }

  tick() {
    // ----- advance step if all requirements have been met -----
    if (this.currentStep.nextStepTrigger.awaitFrontend)
      return

    let shouldAdvance = true

    if (this.targetLocation)
      shouldAdvance =
        shouldAdvance &&
        c.distance(
          this.ship.location,
          this.targetLocation.coordinates,
        ) <= c.ARRIVAL_THRESHOLD

    if (this.currentStep.nextStepTrigger.gainStaminaTo)
      shouldAdvance =
        shouldAdvance &&
        Boolean(
          this.ship.crewMembers.find(
            (cm) =>
              cm.stamina >
              this.currentStep.nextStepTrigger
                .gainStaminaTo!,
          ),
        )

    if (this.currentStep.nextStepTrigger.destroyShipId)
      shouldAdvance =
        shouldAdvance &&
        !this.ship.game.aiShips.find(
          (s) =>
            s.id ===
            this.currentStep.nextStepTrigger.destroyShipId,
        )

    if (this.currentStep.nextStepTrigger.crewLocation)
      shouldAdvance =
        shouldAdvance &&
        Boolean(
          this.ship.crewMembers.find(
            (cm) =>
              cm.location ===
              this.currentStep.nextStepTrigger
                .crewLocation!,
          ),
        )

    if (this.currentStep.nextStepTrigger.useCrewCreditsTo)
      shouldAdvance =
        shouldAdvance &&
        Boolean(
          this.ship.crewMembers.find(
            (cm) =>
              cm.credits <=
              this.currentStep.nextStepTrigger
                .useCrewCreditsTo!,
          ),
        )

    if (this.currentStep.nextStepTrigger.useCommonCreditsTo)
      shouldAdvance =
        shouldAdvance &&
        this.ship.commonCredits <=
          this.currentStep.nextStepTrigger
            .useCommonCreditsTo

    if (shouldAdvance) this.advanceStep()
    this.ship.updateSightAndScanRadius()
  }

  advanceStep() {
    this.step++
    this.currentStep = this.steps[this.step]
    if (!this.currentStep) return this.done()

    c.log(
      `Tutorial advancing to step ${this.step} for ${this.ship.name}`,
    )

    // apply loadout
    if (this.currentStep.forceLoadout) {
      this.ship.equipLoadout(
        this.currentStep.forceLoadout,
        true,
      )
    }

    this.ship.updateSightAndScanRadius()

    // move to step location
    if (this.currentStep.forceLocation) {
      this.ship.previousLocations = []
      this.ship.move([
        this.baseLocation[0] +
          this.currentStep.forceLocation[0],
        this.baseLocation[1] +
          this.currentStep.forceLocation[1],
      ])
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
        })
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
        })
      }
    }

    // crew location
    if (this.currentStep.forceCrewLocation)
      this.ship.crewMembers.forEach(
        (cm) =>
          (cm.location =
            this.currentStep.forceCrewLocation!),
      )

    // crew stamina
    if (this.currentStep.forceStamina !== undefined)
      this.ship.crewMembers.forEach(
        (cm) =>
          (cm.stamina = this.currentStep.forceStamina!),
      )

    // rooms
    if (this.currentStep.shownRooms)
      for (let r of this.currentStep.shownRooms)
        this.ship.addRoom(r)

    // target locations
    if (this.currentStep.nextStepTrigger.location)
      this.targetLocation = {
        coordinates: [
          this.baseLocation[0] +
            this.currentStep.nextStepTrigger.location
              .coordinates[0],
          this.baseLocation[1] +
            this.currentStep.nextStepTrigger.location
              .coordinates[1],
        ],
        label:
          this.currentStep.nextStepTrigger.location.label,
        color:
          this.currentStep.nextStepTrigger.location.color,
      }
    else this.targetLocation = undefined

    // set common credits
    if (this.currentStep.forceCommonCredits) {
      this.ship.commonCredits =
        this.currentStep.forceCommonCredits
      this.ship.toUpdate.commonCredits =
        this.ship.commonCredits
    }

    // show panels on frontend
    this.ship.recalculateShownPanels()

    setTimeout(() => {
      // timeout to come after any tick-related logs
      // // if (!m.channel) this.ship.logEntry(m.message)
      for (let m of this.currentStep.script)
        if (m.channel)
          io.emit(
            `ship:message`,
            this.ship.id,
            m.message,
            m.channel,
          )
    }, c.TICK_INTERVAL)

    this.ship.toUpdate.tutorial = {
      currentStep: this.currentStep,
      targetLocation: this.targetLocation,
    }
  }

  done() {
    c.log(`Tutorial complete for ${this.ship.name}`)

    setTimeout(() => {
      this.ship.logEntry(
        `Good luck out there! If you have more questions about the game, check out the How To Play page!`,
        `high`,
      )
      io.emit(
        `ship:message`,
        this.ship.id,
        `Use this channel to broadcast to and receive messages from nearby ships!`,
        `broadcast`,
      )
    }, c.TICK_INTERVAL)

    this.cleanUp()
    this.ship.tutorial = undefined
    this.ship.toUpdate.tutorial = false
    this.ship.recalculateShownPanels()
    this.ship.respawn(true)

    if (this.ship.planet)
      this.ship.planet
        .shipsAt()
        .filter(
          (s) =>
            s.faction?.color === this.ship.faction?.color,
        )
        .forEach((s) => {
          if (s === this.ship) return
          s.logEntry(
            `${
              this.ship.name
            } has joined the game, starting out from ${
              this.ship.planet && this.ship.planet.name
            }!`,
          )
        })
  }

  cleanUp() {
    this.ship.game.caches.forEach((k) => {
      if (k.onlyVisibleToShipId === this.ship.id)
        this.ship.game.removeCache(k)
    })
    this.ship.game.aiShips.forEach((s) => {
      if (s.onlyVisibleToShipId === this.ship.id)
        this.ship.game.removeShip(s)
    })
  }
}
