import c from '../../../../../common/dist'
import type { CrewMember } from '../CrewMember/CrewMember'

import type { Ship } from '../Ship/Ship'
import { Stubbable } from '../Stubbable'

export class Item extends Stubbable {
  readonly type: ItemType
  readonly id: ItemId
  readonly displayName: string
  readonly description: string
  readonly mass: number = 1000
  readonly repairDifficulty: number = 1
  readonly reliability: number = 1 // higher loses less repair over time
  readonly passives: ShipPassiveEffect[] = []
  readonly rooms: CrewLocation[] = []
  repair = 1
  maxHp: number
  readonly ship: Ship
  announceWhenRepaired = false
  announceWhenBroken = true

  constructor(
    {
      type,
      id,
      displayName,
      description,
      mass,
      repair,
      maxHp,
      hp,
      repairDifficulty,
      reliability,
      passives,
      rooms,
    }: BaseItemData,
    ship: Ship,
    props?: Partial<BaseItemData>,
  ) {
    super()
    this.type = type
    this.id = id
    this.displayName = displayName
    this.description = description
    this.mass = mass
    if (reliability) this.reliability = reliability
    if (repairDifficulty)
      this.repairDifficulty = repairDifficulty
    this.repair = repair ?? props?.repair ?? 1
    this.passives = passives || []
    if (rooms) this.rooms = rooms
    this.ship = ship
    this.maxHp = maxHp
    if (hp !== undefined) this.hp = hp
    if (props?.hp !== undefined) this.hp = props?.hp
  }

  get hp(): number {
    return this.repair * this.maxHp
  }

  set hp(newHp: number) {
    this.repair = newHp / this.maxHp
    this.ship.updateThingsThatCouldChangeOnItemChange()
  }

  get baseData(): BaseItemData {
    return c.items[this.type][this.id]
  }

  use(usePercent: number = 1, users?: CrewMember[]) {
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep?.disableRepair)
      return 0

    const passiveMultiplier = users
      ? 1 -
        users.reduce(
          (total, cm) =>
            total +
            cm.getPassiveIntensity(
              `lessDamageOnEquipmentUse`,
            ),
          0,
        ) /
          users.length
      : 1

    const durabilityLost =
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
      ) *
      usePercent *
      passiveMultiplier
    this.repair -= durabilityLost
    if (this.repair < 0) this.repair = 0
    this.ship.toUpdate._hp = this.ship.hp

    this._stub = null // invalidate stub

    return durabilityLost
  }

  applyRepair(numericAmount: number): boolean {
    let overRepair = false
    this.repair =
      (this.hp + numericAmount / this.repairDifficulty) /
      this.maxHp
    // todo use repair difficulty on more items
    this._stub = null // invalidate stub
    if (this.repair > 1) {
      overRepair = true
      this.repair = 1
      if (this.announceWhenRepaired)
        this.ship.logEntry(
          [
            `Your`,
            {
              text: this.displayName,
              color: `var(--item)`,
              tooltipData: this.toReference() as any,
            },
            `is fully repaired.`,
          ],
          `medium`,
        )
      this.announceWhenRepaired = false
    }
    if (this.repair > 0.1) this.announceWhenBroken = true
    if (this.repair < 0.9) this.announceWhenRepaired = true
    return overRepair
  }

  toReference(): ItemStub {
    return {
      type: this.type,
      id: this.id,
      ownerId: this.ship.id,
    }
  }
}
