import c from '../../../../../../common/dist'
import type { CrewMember } from '../../CrewMember/CrewMember'

import type { Ship } from '../Ship'
import { Stubbable } from '../../Stubbable'

export class Item extends Stubbable {
  readonly type = `item`
  readonly id: string
  readonly itemType: ItemType
  readonly itemId: ItemId
  readonly displayName: string
  readonly description: string
  mass: number = 1000
  repairDifficulty: number = 1
  reliability: number = 1 // higher loses less repair over time
  readonly passives: ShipPassiveEffect[] = []
  readonly rooms: CrewLocation[] = []
  readonly upgradableProperties: UpgradableProperty[]

  repair = 1
  maxHp: number

  upgradable: boolean
  upgradeRequirements: ItemUpgradeRequirements
  upgradeBonus: number
  level: number
  maxLevel: number

  readonly ship: Ship
  announceWhenRepaired = false
  announceWhenBroken = true

  constructor(
    {
      id,
      itemType,
      itemId,
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
      upgradeRequirements,
      upgradableProperties,
      upgradeBonus,
      maxLevel,
    }: BaseItemData,
    ship: Ship,
    props?: Partial<BaseItemData>,
  ) {
    super()
    this.id =
      id || `${itemType}${`${Math.random()}`.slice(2)}`
    this.itemType = itemType
    this.itemId = itemId
    if (rooms) this.rooms = rooms
    this.ship = ship
    this.displayName = displayName
    this.description = description
    this.mass = mass
    if (reliability) this.reliability = reliability
    if (repairDifficulty)
      this.repairDifficulty = repairDifficulty
    this.repair = repair ?? props?.repair ?? 1
    this.passives = passives || []

    this.level = props?.level ?? 1
    this.maxLevel = maxLevel || 1
    this.upgradeBonus =
      upgradeBonus ??
      props?.upgradeBonus ??
      c.itemUpgradeMultiplier
    this.upgradable =
      this.maxLevel > 1 && this.level < this.maxLevel
    this.upgradableProperties = upgradableProperties || []
    this.upgradeRequirements =
      ((upgradeRequirements ?? props?.upgradeRequirements)
        ?.length
        ? upgradeRequirements ?? props?.upgradeRequirements
        : this.getUpgradeRequirements()) ||
      this.getUpgradeRequirements()

    this.maxHp = maxHp
    if (hp !== undefined) this.hp = hp
    if (props?.hp !== undefined) this.hp = props?.hp

    setTimeout(() => {
      // if (this.ship.human)
      //   c.log(
      //     this.displayName,
      //     this.getUpgradeRequirements(),
      //     this.upgradeRequirements,
      //   )

      this.adjustPropsForLevel()
    }, 100)
  }

  get hp(): number {
    return this.repair * this.maxHp
  }

  set hp(newHp: number) {
    this.repair = newHp / this.maxHp
    this.ship.updateThingsThatCouldChangeOnItemChange()
  }

  get baseData(): BaseItemData {
    return c.items[this.itemType][this.itemId]
  }

  toRefundAmount(): number {
    return (
      Math.max(
        0,
        (this.baseData.basePrice.credits || 0) -
          c.itemPriceMultiplier * 50,
      ) * 0.2
    )
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

  applyResearchTowardsUpgrade(amount: number): number {
    if (!this.upgradable || this.level >= this.maxLevel)
      return 0
    const neededResearch = this.upgradeRequirements.find(
      (u) => u.research && (u.required || 0) > 0,
    )
    if (
      !neededResearch ||
      neededResearch.current >= neededResearch.required
    )
      return 0

    this._stub = null // invalidate stub

    const prevTotal = neededResearch.current
    neededResearch.current += amount

    // can't go over
    if (neededResearch.current > neededResearch.required)
      neededResearch.current = neededResearch.required

    this.checkLevelUp()

    return neededResearch.current - prevTotal
  }

  applyResearchCurrencyTowardsUpgrade(amount: number) {
    if (!this.upgradable || this.level >= this.maxLevel)
      return
    const neededResearchCurrency =
      this.upgradeRequirements.find(
        (u) => u.researchCurrency && (u.required || 0) > 0,
      )
    if (!neededResearchCurrency) return

    this._stub = null // invalidate stub

    neededResearchCurrency.current += amount

    // can't go over
    if (
      neededResearchCurrency.current >
      neededResearchCurrency.required
    )
      neededResearchCurrency.current =
        neededResearchCurrency.required

    this.checkLevelUp()
  }

  applyCargoTowardsUpgrade(
    cargoId: CargoId,
    amount: number,
  ) {
    if (!this.upgradable || this.level >= this.maxLevel)
      return
    const neededCargo = this.upgradeRequirements.find(
      (u) =>
        u.cargoId &&
        u.cargoId === cargoId &&
        (u.required || 0) > 0,
    )
    if (!neededCargo) return

    this._stub = null // invalidate stub

    neededCargo.current += amount

    // can't go over
    if (neededCargo.current > neededCargo.required)
      neededCargo.current = neededCargo.required

    this.checkLevelUp()
  }

  checkLevelUp() {
    if (!this.upgradable || this.level >= this.maxLevel)
      return
    for (let requirement of this.upgradeRequirements) {
      if (
        requirement &&
        requirement.current < requirement.required
      )
        return
    }
    this.levelUp()
  }

  levelUp() {
    if (!this.upgradable || this.level >= this.maxLevel)
      return

    this.level++
    this.upgradeRequirements = this.getUpgradeRequirements()
    this.upgradable = this.maxLevel > this.level
    this.adjustPropsForLevel()

    this.ship.logEntry(
      [
        {
          text: this.displayName,
          color: `var(--item)`,
          tooltipData: this.toReference() as any,
        },
        `upgraded to lv. ${this.level}!`,
      ],
      `high`,
      `fix`,
      true,
    )
  }

  adjustPropsForLevel() {
    for (let prop of this.upgradableProperties)
      if (this[prop] && typeof this[prop] === `number`) {
        const base =
          c.items[this.itemType][this.itemId][prop] ?? 1
        let multiplier =
          (this.level - 1) * this.upgradeBonus
        // some props are "better" as they get lower
        // and a negative prop should get closer to zero
        if (
          [`repairDifficulty`, `mass`].includes(prop) ||
          base < 0
        )
          multiplier *= -1
        // some props need to be added to, some need to be multiplied
        const multiply = [
          `passiveThrustMultiplier`,
          `manualThrustMultiplier`,
          `chargeRequired`,
          `mass`,
          `range`,
          `sightRange`,
          `shipScanRange`,
        ].includes(prop)
        if (multiply) this[prop] = base * (1 + multiplier)
        else this[prop] += multiplier
      }
    this._stub = null // invalidate stub
    this.ship.updateThingsThatCouldChangeOnItemChange()
  }

  getUpgradeRequirements(): ItemUpgradeRequirements {
    if (!this.upgradable || this.level >= this.maxLevel)
      return []
    const rarity = this.baseData.rarity
    const requirements: ItemUpgradeRequirements = []

    const requiredResearchAmount =
      (this.baseData.rarity + this.level) *
      this.repairDifficulty *
      100 ** 2
    requirements.push({
      research: true,
      required: requiredResearchAmount,
      current: 0,
    })

    // // add research currency requirement for high level items
    // if (this.baseData.rarity > 5) {
    //   requirements.push({
    //     researchCurrency: {
    //       required: 100,
    //       current: 0,
    //     },
    //   })
    // }

    const addCargoRequirement = () => {
      let cargoSearchRange = 0.5
      let requiredCargoType: CargoData | undefined
      while (!requiredCargoType) {
        requiredCargoType = c
          .shuffleArray(
            Object.values(c.cargo).filter(
              (v) =>
                !requirements.find(
                  (r) => r.cargoId === v.id,
                ),
            ),
          )
          .find(
            (ca) =>
              Math.abs(ca.rarity - rarity) <=
              cargoSearchRange,
          )
        cargoSearchRange += 0.5
      }
      const requiredCargoAmount = Math.ceil(
        (Math.random() * this.level * 3 +
          this.level * this.repairDifficulty) **
          1.5 *
          5,
      )

      requirements.push({
        cargoId: requiredCargoType.id,
        required: requiredCargoAmount,
        current: 0,
      })
    }

    // at least 1
    addCargoRequirement()
    // then possible to add more
    while (
      requirements.length <
        Object.keys(c.cargo).length + 1 &&
      Math.random() <
        c.clamp(
          0,
          (this.level * this.baseData.rarity) / 3,
          0.85,
        )
    )
      addCargoRequirement()

    return requirements
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
            {
              text: this.displayName,
              color: `var(--item)`,
              tooltipData: this.toReference() as any,
            },
            `repaired.`,
          ],
          `medium`,
          `fix`,
          true,
        )
      this.announceWhenRepaired = false
    }
    if (this.repair > 0.1) this.announceWhenBroken = true
    if (this.repair < 0.9) this.announceWhenRepaired = true
    return overRepair
  }

  toReference(): ItemStub {
    return {
      type: `item`,
      itemType: this.itemType,
      itemId: this.itemId,
      id: this.id,
      ownerId: this.ship.id,
    }
  }
}
