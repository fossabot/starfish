import math from './math'
import globals from './globals'
import c from './log'
import { Profiler } from './Profiler'

const gameShipLimit = 100

const gameSpeedMultiplier = 24 * 3

const baseSightRange = 0.2

const baseRepairCost = 30

const maxBroadcastLength = 200

const baseStaminaUse = 0.00002 * gameSpeedMultiplier

const baseXpGain = 0.2 * gameSpeedMultiplier

const factionVendorMultiplier = 0.98

const baseItemSellMultiplier = 0.75

const noEngineThrustMagnitude = 0.02

const aiDifficultyMultiplier = 1

const baseShipScanProperties: {
  id: true
  name: true
  human: true
  ai: true
  dead: true
  attackable: true
  previousLocations: true
  location: true
  planet: (keyof BasePlanetData)[]
  faction: (keyof BaseFactionData)[]
  species: (keyof BaseSpeciesData)[]
  chassis: (keyof BaseChassisData)[]
} = {
  id: true,
  name: true,
  human: true,
  ai: true,
  dead: true,
  attackable: true,
  previousLocations: true,
  location: true,
  planet: [`name`, `location`],
  faction: [`ai`, `name`, `id`, `color`],
  species: [`id`, `singular`, `icon`],
  chassis: [`displayName`],
}

const tactics: Tactic[] = [`aggressive`, `defensive`]
const cargoTypes: (`credits` | CargoType)[] = [
  `salt`,
  `water`,
  `oxygen`,
  `credits`,
]

function getHitDamage(
  weapon: WeaponStub,
  totalMunitionsSkill: number = 0,
) {
  return (
    weapon.damage *
    (1 + (totalMunitionsSkill - 1) / 20) *
    (weapon.repair || 0)
  )
}

function getBaseDurabilityLossPerTick(
  maxHp: number,
  reliability: number,
) {
  return (
    (0.00001 * gameSpeedMultiplier * (10 / maxHp)) /
    reliability
  )
}

function getRadiusDiminishingReturns(
  totalValue: number,
  equipmentCount: number,
) {
  if (equipmentCount === 0) return 0
  return totalValue / Math.sqrt(equipmentCount) || 0
}

function getThrustMagnitudeForSingleCrewMember(
  skill: number = 1,
  engineThrustMultiplier: number = 1,
): number {
  return (
    math.lerp(0.00001, 0.0001, skill / 100) *
    engineThrustMultiplier *
    gameSpeedMultiplier
  )
}

function getRepairAmountPerTickForSingleCrewMember(
  skill: number,
) {
  return (
    (skill / globals.TICK_INTERVAL) *
    0.05 *
    gameSpeedMultiplier
  )
}

function getStaminaGainPerTickForSingleCrewMember() {
  return baseStaminaUse * 1.5
}

function getWeaponCooldownReductionPerTick(level: number) {
  return (2 + level) * 3 * gameSpeedMultiplier
}

function getCrewPassivePriceMultiplier(level: number) {
  return 1 + level ** 2
}

function stubify<BaseType, StubType extends BaseStub>(
  prop: BaseType,
  disallowPropName?: string[],
): StubType {
  const profiler = new Profiler(10, `stubify`, false, 0)
  profiler.step(`getters`)
  const gettersIncluded: any = { ...prop }
  const proto = Object.getPrototypeOf(prop)
  const getKeyValue =
    (key: string) => (obj: Record<string, any>) =>
      obj[key]
  // c.log(Object.getOwnPropertyNames(proto))
  for (const key of Object.getOwnPropertyNames(proto)) {
    const desc = Object.getOwnPropertyDescriptor(proto, key)
    const hasGetter = desc && typeof desc.get === `function`
    if (hasGetter) {
      gettersIncluded[key] = getKeyValue(key)(prop)
    }
  }
  profiler.step(`stringify and parse`)
  const circularReferencesRemoved = JSON.parse(
    JSON.stringify(
      gettersIncluded,
      (key: string, value: any) => {
        if ([`toUpdate`, `_stub`].includes(key)) return
        if (
          [
            `game`,
            `ship`,
            `attacker`,
            `defender`,
            `crewMember`,
            `homeworld`,
          ].includes(key)
        )
          return value?.id ? { id: value.id } : null
        if (disallowPropName?.includes(key))
          return value?.id || undefined
        if ([`ships`].includes(key) && Array.isArray(value))
          return value.map((v) =>
            stubify(v, [
              `visible`,
              `seenPlanets`,
              `enemiesInAttackRange`,
            ]),
          )
        return value
      },
    ),
  ) as StubType
  // circularReferencesRemoved.lastUpdated = Date.now()
  profiler.end()
  return circularReferencesRemoved
}

export default {
  gameShipLimit,
  gameSpeedMultiplier,
  baseSightRange,
  baseRepairCost,
  maxBroadcastLength,
  baseStaminaUse,
  baseXpGain,
  factionVendorMultiplier,
  baseItemSellMultiplier,
  noEngineThrustMagnitude,
  aiDifficultyMultiplier,
  baseShipScanProperties,
  getHitDamage,
  getBaseDurabilityLossPerTick,
  getRadiusDiminishingReturns,
  getRepairAmountPerTickForSingleCrewMember,
  getThrustMagnitudeForSingleCrewMember,
  getStaminaGainPerTickForSingleCrewMember,
  getWeaponCooldownReductionPerTick,
  getCrewPassivePriceMultiplier,
  tactics,
  cargoTypes,
  stubify,
}
