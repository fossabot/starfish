import math from './math'
import globals from './globals'

function getThrustMagnitudeForSingleCrewMember(
  skill: number = 1,
  engineThrustMultiplier: number = 1,
): number {
  return (
    math.lerp(0.0001, 0.001, skill / 100) *
    engineThrustMultiplier
  )
}

function getRepairAmountPerTickForSingleCrewMember(
  skill: number,
) {
  return (skill / globals.TICK_INTERVAL) * 0.3
}

const tactics: Tactic[] = [`aggressive`, `defensive`]
const cargoTypes: (`credits` | CargoType)[] = [
  `food`,
  `metals`,
  `textiles`,
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
          ].includes(key)
        )
          return value?.id || null
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
  getRepairAmountPerTickForSingleCrewMember,
  getThrustMagnitudeForSingleCrewMember,
  tactics,
  cargoTypes,
  stubify,
}
