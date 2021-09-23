import c from './log'
import { Profiler } from './Profiler'

export default function stubify<
  BaseType,
  StubType extends BaseStub,
>(
  baseObject: BaseType,
  disallowKeys: string[] = [],
  allowRecursionDepth: number = 10,
): StubType {
  if (!baseObject) return undefined as any
  const profiler = new Profiler(10, `stubify`, false, 0)
  profiler.step(`apply getters`)
  const objectWithGetters: StubType = applyGettersToObject(
    baseObject,
    disallowKeys,
  )
  profiler.step(`stringify and parse`)
  // c.log(`with getters`, Object.keys(gettersIncluded))

  const objectWithCircularReferencesRemoved: StubType =
    removeCircularReferences(
      objectWithGetters,
      disallowKeys,
      allowRecursionDepth,
    )

  // c.log(`stubify`, objectWithCircularReferencesRemoved)

  profiler.end()
  return objectWithCircularReferencesRemoved
}

// * getters aren't naturally included in functions like Object.keys(), so we apply their result now
function applyGettersToObject<T>(
  baseObject: any,
  disallowKeys: string[] = [],
): T {
  const toDisallow = [...alwaysDisallow, ...disallowKeys]
  const gettersIncluded: any = { ...baseObject }
  const objectPrototype = Object.getPrototypeOf(baseObject)
  const getKeyValue =
    (key: string) => (obj: Record<string, any>) =>
      obj[key]
  // c.log(Object.getOwnPropertyNames(objectPrototype))
  for (const key of Object.getOwnPropertyNames(
    objectPrototype,
  )) {
    if (toDisallow.includes(key)) continue
    const descriptor = Object.getOwnPropertyDescriptor(
      objectPrototype,
      key,
    )
    const hasGetter =
      descriptor && typeof descriptor.get === `function`
    if (hasGetter)
      gettersIncluded[key] = getKeyValue(key)(baseObject)
  }
  return gettersIncluded as T
}

const recursivelyRemoveCircularReferencesInObject = (
  obj: any,
  disallowedKeys: string[],
  remainingDepth: number,
  passedKey?: string,
  track?: boolean,
) => {
  let newObj = {}
  if (remainingDepth <= 0) {
    if (track)
      c.log(
        `reached depth limit`,
        obj,
        toStubOrUndefined(obj),
      )
    return toStubOrUndefined(obj)
  }

  // array
  if (Array.isArray(obj)) {
    newObj = obj.map((v) =>
      recursivelyRemoveCircularReferencesInObject(
        v,
        disallowedKeys,
        remainingDepth - 1,
        passedKey,
        track,
      ),
    )
    // if (passedKey === `steps`)
    //   c.log(`tutorial`, remainingDepth, obj, newObj)
  }
  // string
  else if (typeof obj === `string` || obj instanceof String)
    newObj = obj
  // object
  else if (obj && typeof obj === `object`)
    for (const key of Object.keys(obj)) {
      const value = obj[key]
      // null/undefined
      if (value === null || value === undefined) {
        newObj[key] = undefined
      }
      // disallowed key => stub
      else if (
        disallowedKeys.includes(key) &&
        typeof value === `object` &&
        !Array.isArray(value)
      ) {
        newObj[key] = toStubOrUndefined(value)
      }
      // nested object
      else if (typeof value === `object`) {
        newObj[key] =
          recursivelyRemoveCircularReferencesInObject(
            value,
            disallowedKeys,
            remainingDepth - 1,
            key,
            track,
          )
      }
      // anything else
      else {
        newObj[key] = value
      }
    }
  // fallback
  else newObj = obj

  if (track) c.log(`tracked`, passedKey, obj, newObj)

  return newObj
}

function removeCircularReferences<T>(
  baseObject: T,
  disallowKeys: string[] = [],
  allowRecursionDepth,
): T {
  const toDisallow = [...alwaysDisallow, ...disallowKeys]

  return recursivelyRemoveCircularReferencesInObject(
    baseObject,
    toDisallow,
    allowRecursionDepth,
  ) as T
}

const toStubOrUndefined = (obj: any) => {
  if (!obj) return null
  if (typeof obj === `string` || obj instanceof String)
    return obj
  if (typeof obj !== `object`) return obj
  const returnObj: any = {}
  if (obj.id) returnObj.id = obj.id
  if (obj.name) returnObj.name = obj.name
  if (obj.type) returnObj.type = obj.type
  if (Object.keys(returnObj).length === 0) return undefined
  return returnObj
}

const alwaysDisallow = [
  `toUpdate`,
  `_stub`,
  `_id`,
  `game`,
  `ship`,
  `ships`,
  `attacker`,
  `defender`,
  `crewMember`,
  `homeworld`,
  `faction`,
  `species`,
]

// try {
//   circularReferencesRemoved = JSON.parse(
//     JSON.stringify(
//       gettersIncluded,
//       (key: string, value: any) => {
//         if ([`toUpdate`, `_stub`, `_id`].includes(key))
//           return undefined

//         // if (baseObject.ai === false)
//         //   c.log(`key`, key, value)
//         if (
//           [
//             `game`,
//             `ship`,
//             `ships`,
//             `attacker`,
//             `defender`,
//             `crewMember`,
//             `homeworld`,
//             `faction`,
//             `species`,
//           ].includes(key)
//         )
//           return Array.isArray(value)
//             ? value.map((v) =>
//                 v.id ? { id: v.id } : null,
//               )
//             : value?.id
//             ? { id: value.id }
//             : null

//         if (disallowKeys?.includes(key))
//           return value?.id ? { id: value.id } : null

//         if (
//           value &&
//           typeof value === `object` &&
//           !Array.isArray(value)
//         ) {
//           // if (allowRecursionDepth)
//           //   return stubify(
//           //     value,
//           //     disallowKeys,
//           //     allowRecursionDepth,
//           //   )
//           return value?.id
//             ? { id: value.id }
//             : value?.name
//             ? { name: value.name }
//             : null
//         }

//         // if (
//         //   [`ships`].includes(key) &&
//         //   Array.isArray(value)
//         // )
//         //   if (allowRecursionDepth)
//         //     return value.map((v) =>
//         //       stubify(
//         //         v,
//         //         [
//         //           `visible`,
//         //           `seenPlanets`,
//         //           `seenLandmarks`,
//         //           `enemiesInAttackRange`,
//         //         ],
//         //         allowRecursionDepth,
//         //       ),
//         //     )
//         //   else
//         //     return value.map((v) =>
//         //       v?.id
//         //         ? { id: v.id }
//         //         : v?.name
//         //         ? { name: v.name }
//         //         : null,
//         //     )

//         return value
//       },
//     ),
//   ) as StubType
// } catch (e) {
//   c.log(`red`, `Failed to stubify`, baseObject, e)
//   c.trace()
// }
// circularReferencesRemoved.lastUpdated = Date.now()
