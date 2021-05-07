import c from '../../../common/dist'
import { io, connected } from './index'

export async function get(
  id: string,
): Promise<ShipStub | null> {
  if (!(await connected())) return null
  const shipStub: ShipStub | null = await new Promise(
    (resolve) => {
      io.emit(
        `ship:get`,
        id,
        ({
          data: ship,
          error,
        }: IOResponseReceived<ShipStub>) => {
          if (!ship || error) {
            c.log(error)
            resolve(null)
            return
          }
          resolve(ship)
        },
      )
    },
  )
  return shipStub
}

export async function create(
  data: BaseHumanShipData,
): Promise<ShipStub | null> {
  if (!(await connected())) return null

  const shipStub: ShipStub | null = await new Promise(
    (resolve) => {
      io.emit(
        `ship:create`,
        data,
        ({
          data: ship,
          error,
        }: IOResponseReceived<ShipStub>) => {
          if (!ship || error) {
            c.log(error)
            resolve(null)
            return
          }
          resolve(ship)
        },
      )
    },
  )
  return shipStub
}

// export async function thrust(
//   data: ThrustRequest,
// ): Promise<ThrustResult | null> {
//   if (!(await connected())) return null

//   const res: ThrustResult | null = await new Promise(
//     (resolve) => {
//       io.emit(
//         `ship:thrust`,
//         data,
//         ({
//           data: thrustResult,
//           error,
//         }: IOResponseReceived<ThrustResult>) => {
//           if (!thrustResult || error) {
//             c.log(error)
//             resolve(null)
//             return
//           }
//           resolve(thrustResult)
//         },
//       )
//     },
//   )
//   return res
// }

export async function attack(
  data: AttackRequest,
): Promise<TakenDamageResult | null> {
  if (!(await connected())) return null

  const res: TakenDamageResult | null = await new Promise(
    (resolve) => {
      io.emit(
        `ship:attack`,
        data,
        ({
          data: attackResult,
          error,
        }: IOResponseReceived<TakenDamageResult>) => {
          if (!attackResult || error) {
            c.log(error)
            resolve(null)
            return
          }
          resolve(attackResult)
        },
      )
    },
  )
  return res
}
