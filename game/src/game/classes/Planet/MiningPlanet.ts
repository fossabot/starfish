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

  getMineRequirement(cargoId: CargoId): number {
    const rarity = c.cargo[cargoId].rarity + 1
    return Math.floor(
      (Math.random() + 0.3) * 5000 * (rarity + 1) ** 1.6,
    )
  }

  getMaxMineableBoost(cargoId: CargoId): number {
    const rarity = c.cargo[cargoId].rarity + 1
    const scaledByLevel = this.level / rarity
    return Math.floor(
      (Math.random() + 0.3) * 100 * scaledByLevel,
    )
  }

  getPayoutAmount(
    cargoId: CargoId,
    maxMineable?: number,
  ): number {
    return Math.min(
      maxMineable ??
        this.mine.find((m) => m.id === cargoId)
          ?.maxMineable ??
        Infinity,
      Math.floor(
        3 +
          Math.random() *
            20 *
            c.lerp(1, 10, this.level / 100),
      ),
    )
  }

  mineResource(cargoId: MinePriorityType, amount: number) {
    if (!this.mine.length) return
    if (
      cargoId === `closest` ||
      !this.mine.find((m) => m.id === cargoId)
    )
      cargoId = this.mine
        .filter((m) => m.maxMineable)
        .reduce(
          (closest, m) =>
            closest.mineCurrent / closest.mineRequirement >
            m.mineCurrent / m.mineRequirement
              ? closest
              : m,
          this.mine[0],
        ).id

    const resource = this.mine.find((m) => m.id === cargoId)
    if (!resource || !resource.mineRequirement) return

    resource.mineCurrent += amount

    // * ----- done mining, pay out -----
    if (resource.mineCurrent >= resource.mineRequirement) {
      // update max mineable
      if (resource.maxMineable) {
        resource.maxMineable -= resource.payoutAmount
        if (resource.maxMineable < 1)
          resource.maxMineable = 0
      }

      // distribute among all current mining ships
      const shipsToDistributeAmong = this.shipsAt.filter(
        (s) =>
          s.crewMembers.find(
            (cm) =>
              cm.location === `mine` &&
              (cm.minePriority === cargoId ||
                cm.minePriority === `closest` ||
                !this.mine.find(
                  (m) => m.id === cm.minePriority,
                )),
          ),
      )

      const amountBoostPassive =
        shipsToDistributeAmong.reduce(
          (total, s) =>
            s.getPassiveIntensity(`boostMinePayouts`) +
            total,
          0,
        )

      const finalPayoutAmount =
        resource.payoutAmount * (amountBoostPassive + 1)
      const didBoost = amountBoostPassive > 0

      c.log(
        `gray`,
        `${shipsToDistributeAmong.length} ships mined ${finalPayoutAmount} tons of ${cargoId} from ${this.name}.`,
      )

      shipsToDistributeAmong.forEach((ship) => {
        ship.logEntry(
          shipsToDistributeAmong.length > 1
            ? [
                `Your ship helped mine ${c.r2(
                  finalPayoutAmount,
                  0,
                )} tons of`,
                {
                  text: cargoId,
                  tooltipData: {
                    type: `cargo`,
                    id: cargoId,
                  },
                  color: `var(--cargo)`,
                },
                `&nospace, ${
                  didBoost
                    ? `(passive payout boost: +${
                        c.r2(amountBoostPassive) * 100
                      }%) `
                    : ``
                }which was split with ${
                  shipsToDistributeAmong.length - 1
                } other ship ${
                  shipsToDistributeAmong.length - 1 === 1
                    ? ``
                    : `s`
                } for a total of ${c.r2(
                  finalPayoutAmount /
                    shipsToDistributeAmong.length,
                )} tons.`,
              ]
            : [
                `Your ship mined ${c.r2(
                  finalPayoutAmount,
                  0,
                )} tons of`,
                {
                  text: cargoId,
                  tooltipData: {
                    type: `cargo`,
                    id: cargoId,
                  },
                  color: `var(--cargo)`,
                },
                `&nospace${
                  didBoost
                    ? ` (passive payout boost: +${
                        c.r2(amountBoostPassive) * 100
                      }%)`
                    : ``
                }.`,
              ],
        )

        const crewMembersWhoHelped =
          ship.crewMembers.filter(
            (cm) =>
              cm.location === `mine` &&
              (cm.minePriority === cargoId ||
                cm.minePriority === `closest` ||
                !this.mine.find(
                  (m) => m.id === cm.minePriority,
                )),
          )
        crewMembersWhoHelped.forEach((cm) => {
          cm.addStat(
            `totalTonsMined`,
            finalPayoutAmount /
              shipsToDistributeAmong.length /
              crewMembersWhoHelped.length,
          )
        })

        ship.addStat(
          `totalTonsMined`,
          finalPayoutAmount / shipsToDistributeAmong.length,
        )

        ship.distributeCargoAmongCrew([
          {
            id: cargoId as CargoId,
            amount: c.r2(
              finalPayoutAmount /
                shipsToDistributeAmong.length,
              0,
              true,
            ),
          },
        ])
      })

      this.resetForNextMine(cargoId)
    }

    this.updateFrontendForShipsAt()
  }

  resetForNextMine(cargoId: CargoId) {
    const resource = this.mine.find((m) => m.id === cargoId)
    if (!resource) return

    // fully exhausted
    if (resource.maxMineable === 0) {
      this.shipsAt.forEach((ship) => {
        ship.logEntry([
          `${this.name}'s vein of ${
            c.cargo[resource.id].name
          } has been exhausted.`,
        ])
      }, `low`)
      resource.mineCurrent = 0
      resource.mineRequirement = 0
      resource.payoutAmount = 0
      return
    }

    // reset for next time
    resource.mineRequirement =
      this.getMineRequirement(cargoId)
    resource.payoutAmount = this.getPayoutAmount(cargoId)
    resource.mineCurrent = 0
  }

  async levelUp() {
    super.levelUp()

    if (this.level > 1 && Math.random() > 0.2) {
      this.addPassive({
        id: `boostMineSpeed`,
        intensity: 0.01,
      })
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

  addMineResource(toAdd: CargoId) {
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
        existing.mineRequirement =
          this.getMineRequirement(toAdd)
        existing.payoutAmount = this.getPayoutAmount(toAdd)
      }
      return
    }

    // new resource
    const payoutAmount = this.getPayoutAmount(
      toAdd,
      amountToAdd,
    )
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
    this.level = 0
    this.xp = 0
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
