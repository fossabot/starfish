import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import { Planet } from './Planet'

export class MiningPlanet extends Planet {
  readonly pacifist: boolean
  readonly rooms: CrewLocation[] = [`mine`]

  mine: PlanetMine = []

  constructor(data: BaseMiningPlanetData, game?: Game) {
    super(data, game)

    if (data.pacifist) this.pacifist = data.pacifist
    else this.pacifist = false

    if (data.mine) this.mine = data.mine

    if (!this.mine.length) this.levelUp()
  }

  daily() {
    super.daily()
    this.mine.forEach((resource) => {
      // * add a drip feed of resources to all active mines
      if (resource.maxMineable === undefined) return
      const boost = this.getMaxMineableBoost(resource.id)
      if (resource.maxMineable * 3 >= boost) return
      const dailyAdd = boost / 40
      resource.maxMineable = Math.ceil(dailyAdd + resource.maxMineable)
      c.log(resource, boost)
    })
  }

  getMineRequirement(resourceId: MineableResource): number {
    const rarity = (c.cargo[resourceId]?.rarity || 7) + 1
    return Math.floor((Math.random() + 0.25) * 700 * (rarity + 1) ** 1.2)
  }

  getMaxMineableBoost(resourceId: MineableResource): number {
    if (resourceId === `crewCosmeticCurrency`)
      return Math.ceil((Math.random() + 0.5) * 1500)
    if (resourceId === `shipCosmeticCurrency`)
      return Math.ceil((Math.random() + 0.5) * 2)
    const rarity = (c.cargo[resourceId]?.rarity || 100) + 1
    const scaledByLevel = Math.max(this.level, 1) / Math.max(rarity, 1)
    return Math.ceil(10 + (Math.random() + 0.3) * 100 * scaledByLevel)
  }

  getPayoutAmount(resourceId: MineableResource, maxMineable?: number): number {
    if (resourceId === `crewCosmeticCurrency`)
      return Math.min(
        maxMineable ??
          this.mine.find((m) => m.id === resourceId)?.maxMineable ??
          Infinity,
        Math.ceil((Math.random() + 0.5) * 1000),
      )
    if (resourceId === `shipCosmeticCurrency`)
      return Math.min(
        maxMineable ??
          this.mine.find((m) => m.id === resourceId)?.maxMineable ??
          Infinity,
        Math.ceil((Math.random() + 0.5) * 2),
      )
    return Math.min(
      maxMineable ??
        this.mine.find((m) => m.id === resourceId)?.maxMineable ??
        Infinity,
      Math.floor(3 + Math.random() * 20 * c.lerp(1, 10, this.level / 100)),
    )
  }

  mineResource(resourceId: MinePriorityType, amount: number) {
    if (!this.mine.length) return
    if (resourceId === `closest` || !this.mine.find((m) => m.id === resourceId))
      resourceId = this.mine
        .filter((m) => m.maxMineable)
        .reduce(
          (closest, m) =>
            closest.mineCurrent / closest.mineRequirement >
            m.mineCurrent / m.mineRequirement
              ? closest
              : m,
          this.mine[0],
        ).id

    const resource = this.mine.find((m) => m.id === resourceId)
    if (!resource) return
    if (!resource.mineRequirement) {
      if ((resource.maxMineable || 0) > 0) this.resetForNextMine(resourceId)
      if (!resource.mineRequirement) return
    }

    resource.mineCurrent += amount

    const currentlyMiningShips = this.shipsAt.filter((s) =>
      s.crewMembers.find(
        (cm) =>
          cm.location === `mine` &&
          (cm.minePriority === resourceId ||
            cm.minePriority === `closest` ||
            !this.mine.find((m) => m.id === cm.minePriority)),
      ),
    )

    // * chance to randomly discover cosmetic currencies
    currentlyMiningShips.forEach((ship) => {
      if (c.lottery(1, 1000000000 / c.tickInterval)) {
        const amount = Math.random() > 0.8 ? 2 : 1
        ship.logEntry(
          [
            `Discovered 💎${amount}`,
            {
              text:
                amount === 1
                  ? c.shipCosmeticCurrencySingular
                  : c.shipCosmeticCurrencyPlural,
              color: `var(--shipCosmeticCurrency)`,
            },
            `&nospace!`,
          ],
          `high`,
          `diamond`,
          true,
        )
        ship.distributeCargoAmongCrew([
          {
            id: `shipCosmeticCurrency`,
            amount,
          },
        ])
      }
      if (c.lottery(1, 1000000000 / c.tickInterval)) {
        const amount = Math.round((Math.random() + 0.1) * 400)
        ship.logEntry(
          [
            `Discovered 🟡${amount}`,
            {
              text:
                amount === 1
                  ? c.shipCosmeticCurrencySingular
                  : c.crewCosmeticCurrencyPlural,
              color: `var(--crewCosmeticCurrency)`,
            },
            `&nospace!`,
          ],
          `high`,
          `diamond`,
          true,
        )
        ship.distributeCargoAmongCrew([
          {
            id: `crewCosmeticCurrency`,
            amount,
          },
        ])
      }
    })

    // * ----- done mining, pay out -----
    if (resource.mineCurrent >= resource.mineRequirement) {
      // update max mineable
      if (resource.maxMineable) {
        resource.maxMineable -= resource.payoutAmount
        if (resource.maxMineable < 1) resource.maxMineable = 0
      }

      // distribute among all current mining ships

      const amountBoostPassive = currentlyMiningShips.reduce(
        (total, s) => s.getPassiveIntensity(`boostMinePayouts`) + total,
        0,
      )

      const finalPayoutAmount = c.r2(
        resource.payoutAmount * (amountBoostPassive + 1),
        0,
      )
      const didBoost = amountBoostPassive > 0

      c.log(
        `gray`,
        `${currentlyMiningShips.length} ships mined ${finalPayoutAmount}${
          c.cargo[resourceId] ? ` tons of` : ``
        } ${resourceId} from ${this.name}.`,
      )

      currentlyMiningShips.forEach((ship) => {
        ship.logEntry(
          currentlyMiningShips.length > 1
            ? [
                `Mined ${c.r2(finalPayoutAmount, 0)}${
                  c.cargo[resourceId] ? ` tons of` : ``
                }`,
                {
                  text:
                    resourceId === `crewCosmeticCurrency`
                      ? `🟡` + c.crewCosmeticCurrencyPlural
                      : resourceId === `shipCosmeticCurrency`
                      ? `💎` + c.shipCosmeticCurrencyPlural
                      : resourceId,
                  tooltipData: c.cargo[resourceId]
                    ? {
                        type: `cargo`,
                        id: resourceId,
                      }
                    : undefined,
                  color: `var(--cargo)`,
                },
                `&nospace, ${
                  didBoost ? `(+${c.r2(amountBoostPassive) * 100}%) ` : ``
                }split with ${currentlyMiningShips.length - 1} other ship ${
                  currentlyMiningShips.length - 1 === 1 ? `` : `s`
                }. You got ${c.r2(
                  finalPayoutAmount / currentlyMiningShips.length,
                  0,
                  true,
                )}${c.cargo[resourceId] ? ` tons` : ``}.`,
              ]
            : [
                `Mined ${c.r2(finalPayoutAmount, 0)}${
                  c.cargo[resourceId] ? ` tons of` : ``
                }`,
                {
                  text:
                    resourceId === `crewCosmeticCurrency`
                      ? `🟡` + c.crewCosmeticCurrencyPlural
                      : resourceId === `shipCosmeticCurrency`
                      ? `💎` + c.shipCosmeticCurrencyPlural
                      : resourceId,
                  tooltipData: c.cargo[resourceId]
                    ? {
                        type: `cargo`,
                        id: resourceId,
                      }
                    : undefined,
                  color: `var(--cargo)`,
                },
                `&nospace${
                  didBoost ? ` (+${c.r2(amountBoostPassive) * 100}%)` : ``
                }.`,
              ],
          `medium`,
          `mine`,
          true,
        )

        const crewMembersWhoHelped = ship.crewMembers.filter(
          (cm) =>
            cm.location === `mine` &&
            (cm.minePriority === resourceId ||
              cm.minePriority === `closest` ||
              !this.mine.find((m) => m.id === cm.minePriority)),
        )
        crewMembersWhoHelped.forEach((cm) => {
          cm.addStat(
            `totalTonsMined`,
            finalPayoutAmount /
              currentlyMiningShips.length /
              crewMembersWhoHelped.length,
          )
        })

        ship.addStat(
          `totalTonsMined`,
          finalPayoutAmount / currentlyMiningShips.length,
        )

        ship.distributeCargoAmongCrew([
          {
            id: resourceId as MineableResource,
            amount: c.r2(
              finalPayoutAmount / currentlyMiningShips.length,
              0,
              true,
            ),
          },
        ])
      })

      this.resetForNextMine(resourceId)
    }

    this.updateFrontendForShipsAt()
  }

  resetForNextMine(resourceId: MineableResource) {
    const resource = this.mine.find((m) => m.id === resourceId)
    if (!resource) return

    // fully exhausted
    if (resource.maxMineable === 0) {
      this.shipsAt.forEach((ship) => {
        ship.logEntry(
          [
            {
              text: this.name,
              color: this.color,
            },
            `&nospace's ${(
              c.cargo[resource.id]?.name ||
              (resourceId === `shipCosmeticCurrency`
                ? c.shipCosmeticCurrencyPlural
                : resourceId === `crewCosmeticCurrency`
                ? c.crewCosmeticCurrencyPlural
                : `resources`)
            ).toLowerCase()} vein exhausted.`,
          ],
          `low`,
          `mine`,
        )
      })
      resource.mineCurrent = 0
      resource.mineRequirement = 0
      resource.payoutAmount = 0
      return
    }

    // reset for next time
    resource.mineRequirement = this.getMineRequirement(resourceId)
    resource.payoutAmount = this.getPayoutAmount(resourceId)
    resource.mineCurrent = 0
  }

  async levelUp() {
    super.levelUp()

    //* high chance to add mine speed boost
    if (this.level > 1 && Math.random() > 0.2) {
      this.addPassive({
        id: `boostMineSpeed`,
        intensity: 0.01,
      })
    }

    //* low chance to add orbital defense
    if (this.level > 3 && Math.random() > 0.9) {
      this.defense += 1
    }

    // todo add more passives

    // * randomly selected for now, with a bias towards things that are already here
    const mineableResourceToAdd = c.randomFromArray([
      ...Object.keys(c.cargo),
      ...this.mine.map((m) => m.id),
      ...this.mine.map((m) => m.id),
      ...this.mine.map((m) => m.id),
      ...this.mine.map((m) => m.id),
    ]) as CargoId
    this.addMineResource(mineableResourceToAdd)

    this.updateFrontendForShipsAt()
  }

  addMineResource(toAdd: MineableResource) {
    const amountToAdd = this.getMaxMineableBoost(toAdd)

    const existing = this.mine.find((m) => m.id === toAdd)
    // existing resource
    if (existing) {
      if (existing.maxMineable)
        // if it's in progress, just add to the max in the background
        existing.maxMineable += amountToAdd
      else {
        // reset payouts etc if it has been exhausted
        existing.maxMineable = amountToAdd
        existing.mineRequirement = this.getMineRequirement(toAdd)
        existing.payoutAmount = this.getPayoutAmount(toAdd)
      }
      return
    }

    // new resource
    const payoutAmount = this.getPayoutAmount(toAdd, amountToAdd)
    this.mine.push({
      id: toAdd,
      mineCurrent: 0,
      maxMineable: amountToAdd,
      mineRequirement: this.getMineRequirement(toAdd),
      payoutAmount: payoutAmount,
    })
  }

  resetLevels(toDefault?: boolean) {
    const targetLevel = toDefault ? 1 : this.level
    const targetXp = toDefault ? 0 : this.xp
    super.resetLevels()
    this.mine = []
    this.passives = []
    while (this.level < targetLevel) {
      this.levelUp()
    }
    this.xp = targetXp
    this.updateFrontendForShipsAt()
  }
}

/*

----- mining planets -----
- have specific types of resource you can mine
gathered resources are held by the individual who mined them, and shared once that crew member's inventory is full
must put crew members into "mining" room aka planetside, actually mining
  select what resource you want to mine
add mining skill?
more ships mining from the same guild boosts mining speed
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
