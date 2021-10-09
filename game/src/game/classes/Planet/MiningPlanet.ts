import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import { Planet } from './Planet'

export class MiningPlanet extends Planet {
  readonly pacifist: boolean
  readonly rooms: CrewLocation[] = [`mine`]

  mine: PlanetMine = []

  constructor(data: BaseMiningPlanetData, game: Game) {
    super(data, game)

    if (data.pacifist) this.pacifist = data.pacifist
    else this.pacifist = false

    if (data.mine) this.mine = data.mine

    if (!this.mine.length) this.levelUp()
  }

  getMineRequirement(cargoId): number {
    const rarity = c.cargo[cargoId].rarity + 1
    return Math.floor(
      ((Math.random() + 0.1) * 85000 * (rarity / 3)) / 20,
    )
  }

  getPayoutAmount(cargoId: CargoId): number {
    return Math.floor(
      1 +
        Math.random() *
          20 *
          c.lerp(1, 10, this.level / 100),
    )
  }

  mineResource(cargoId: MinePriorityType, amount: number) {
    if (
      cargoId === `closest` ||
      !this.mine.find((m) => m.id === cargoId)
    )
      cargoId = this.mine.reduce(
        (closest, m) =>
          closest.mineCurrent / closest.mineRequirement >
          m.mineCurrent / m.mineRequirement
            ? closest
            : m,
        this.mine[0],
      ).id

    const resource = this.mine.find((m) => m.id === cargoId)
    if (!resource) return

    resource.mineCurrent += amount
    // * ----- done mining, pay out -----
    if (resource.mineCurrent >= resource.mineRequirement) {
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

      // reset for next time
      resource.mineRequirement =
        this.getMineRequirement(cargoId)
      resource.payoutAmount = this.getPayoutAmount(cargoId)
      resource.mineCurrent = 0
    }

    this.updateFrontendForShipsAt()
  }

  async levelUp() {
    super.levelUp()

    if (this.level > 1) {
      this.addPassive({
        id: `boostMineSpeed`,
        intensity: 0.05,
      })
    }

    // todo add more passives

    if (this.mine.length === 0 || Math.random() > 0.6) {
      // * randomly selected for now
      const mineableResourceToAdd = c.randomFromArray(
        Object.keys(c.cargo),
      ) as CargoId
      this.addMineResource(mineableResourceToAdd)
    }

    this.updateFrontendForShipsAt()
  }

  addMineResource(toAdd: CargoId) {
    if (this.mine.find((m) => m.id === toAdd)) return
    this.mine.push({
      id: toAdd,
      mineCurrent: 0,
      mineRequirement: this.getMineRequirement(toAdd),
      payoutAmount: this.getPayoutAmount(toAdd),
    })
  }

  resetLevels(toDefault?: boolean) {
    const targetLevel = toDefault ? 1 : this.level
    const targetXp = this.xp
    this.level = 0
    this.xp = 0
    this.mine = []
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
