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
    gainStaminaTo?: number
    useCrewCreditsTo?: number
    useCommonCreditsTo?: number
    awaitFrontend?: boolean
  }
}

export class Tutorial {
  step: number = 0
  spawnedShips: string[] = []
  spawnedCaches: string[] = []

  steps: TutorialStepData[] = []
  baseLocation: CoordinatePair = [0, 0]
  currentStep: TutorialStepData
  ship: HumanShip
  targetLocation?: TargetLocation

  initializeSteps() {
    this.steps = [
      {
        forceLocation: [0, 0],
        sightRange: 0.01,
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
        sightRange: 0.01,
        shownRooms: [],
        shownPanels: [`mapZoom`],
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
      {
        sightRange: 0.01,
        shownRooms: [],
        shownPanels: [`mapZoom`, `map`],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`, `cache`],
        script: [
          {
            message: `Oho! That's clarified things a bit. We can now see for 0.01AU, which is a pretty long way, galactically speaking — somewhere around 1.5 million kilometers.`,
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
            location: [0.005, 0],
          },
        ],
        nextStepTrigger: {
          awaitFrontend: true,
          location: {
            coordinates: [0.005, 0],
            label: `cache`,
          },
        },
      },
      {
        sightRange: 0.01,
        shownRooms: [`cockpit`],
        forceCrewLocation: `cockpit`,
        shownPanels: [`mapZoom`, `map`, `room`],
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
            coordinates: [0.005, 0],
            label: `cache`,
          },
        },
      },
      {
        sightRange: 0.01,
        shownRooms: [`cockpit`],
        shownPanels: [`mapZoom`, `map`, `log`],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`],
        script: [
          {
            message: `Awesome, we got it! <br />
            There were some 💳credits inside! Credits are how you pay for cargo and equipment. Every crew member has their own stock of cargo and credits.<br />
            Caches will spawn around the map whenever cargo is dropped, whether intentionally or because... well, you know... someone got blown up.`,
            next: `Is it really that dangerous out here?`,
          },
          {
            message: `It can be! Let's head back planetside to regroup.`,
          },
        ],
        nextStepTrigger: {
          location: {
            coordinates: [0, 0],
            label: `back home`,
          },
        },
      },

      // ----------
      {
        sightRange: 0.01,
        shownRooms: [`cockpit`],
        shownPanels: [`mapZoom`, `map`, `log`],
        disableRepair: true,
        disableStamina: true,
        visibleTypes: [`planet`],
        script: [
          {
            message: `final`,
            advance: `end tutorial`,
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
        const spawned = this.ship.game.addCache({
          ...k,
          location: [
            this.baseLocation[0] + k.location[0],
            this.baseLocation[1] + k.location[1],
          ],
          onlyVisibleToShipId: this.ship.id,
        })
        this.spawnedCaches.push(spawned.id)
      }
    }
    // spawn ais
    if (this.currentStep.ais) {
      for (let s of this.currentStep.ais) {
        const spawned = this.ship.game.addAIShip({
          ...s,
          location: s.location
            ? [
                this.baseLocation[0] + s.location[0],
                this.baseLocation[1] + s.location[1],
              ]
            : [...this.baseLocation],
          onlyVisibleToShipId: this.ship.id,
        })
        this.spawnedShips.push(spawned.id)
      }
    }

    // crew location
    if (this.currentStep.forceCrewLocation)
      this.ship.crewMembers.forEach(
        (cm) =>
          (cm.location =
            this.currentStep.forceCrewLocation!),
      )

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
    this.ship.logEntry(
      `Good luck out there! If you have more questions about the game, check out the How To Play page!`,
    )
    this.cleanUp()
    this.ship.tutorial = undefined
    this.ship.toUpdate.tutorial = false
    this.ship.recalculateShownPanels()
    this.ship.respawn(true)
  }

  cleanUp() {
    for (let id of this.spawnedShips) {
      const toDelete = this.ship.game.ships.find(
        (s) => s.id,
      )
      if (toDelete) this.ship.game.removeShip(toDelete)
    }
    for (let id of this.spawnedCaches) {
      const toDelete = this.ship.game.caches.find(
        (k) => k.id,
      )
      if (toDelete) this.ship.game.removeCache(toDelete)
    }
  }
}
