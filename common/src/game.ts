import math from './math'
import globals from './globals'
import c from './log'

const gameSpeedMultiplier = 24 * 3

const baseSightRange = 0.2

const baseRepairCost = 100

const maxBroadcastLength = 200

const baseStaminaUse = 0.00002 * gameSpeedMultiplier

const baseXpGain = 0.5 * gameSpeedMultiplier

const factionVendorMultiplier = 0.99

const baseItemSellMultiplier = 0.75

const noEngineThrustMagnitude = 0.02

function getBaseDurabilityLossPerTick(maxHp: number) {
  return 0.00001 * gameSpeedMultiplier * (10 / maxHp)
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
    0.1 *
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

const tactics: Tactic[] = [`aggressive`, `defensive`]
const cargoTypes: (`credits` | CargoType)[] = [
  `salt`,
  `water`,
  `oxygen`,
  `credits`,
]

function stubify<BaseType, StubType extends BaseStub>(
  prop: BaseType,
  disallowPropName?: string[],
): StubType {
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
  const circularReferencesRemoved = JSON.parse(
    JSON.stringify(
      gettersIncluded,
      (key: string, value: any) => {
        if ([`toUpdate`].includes(key)) return
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
  return circularReferencesRemoved
}

export default {
  gameSpeedMultiplier,
  baseSightRange,
  baseRepairCost,
  maxBroadcastLength,
  baseStaminaUse,
  baseXpGain,
  factionVendorMultiplier,
  baseItemSellMultiplier,
  noEngineThrustMagnitude,
  getBaseDurabilityLossPerTick,
  getRepairAmountPerTickForSingleCrewMember,
  getThrustMagnitudeForSingleCrewMember,
  getStaminaGainPerTickForSingleCrewMember,
  getWeaponCooldownReductionPerTick,
  getCrewPassivePriceMultiplier,
  tactics,
  cargoTypes,
  stubify,
}
