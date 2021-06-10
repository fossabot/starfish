import c from '../../../common/dist'
import { io, connected } from './index'

export async function setCaptain(
  shipId: string,
  crewMemberId: string,
): Promise<string | null> {
  const error: string | null = await new Promise(
    (resolve) => {
      io.emit(
        `ship:setCaptain`,
        shipId,
        crewMemberId,
        ({ data, error }: IOResponseReceived<string>) => {
          if (error) {
            c.log(error)
            resolve(error)
            return
          }
          resolve(null)
        },
      )
    },
  )
  return error // null = ok
}

export async function kickMember(
  shipId: string,
  crewMemberId: string,
): Promise<string | null> {
  const error: string | null = await new Promise(
    (resolve) => {
      io.emit(
        `ship:kickMember`,
        shipId,
        crewMemberId,
        ({ data, error }: IOResponseReceived<string>) => {
          if (error) {
            c.log(error)
            resolve(error)
            return
          }
          resolve(null)
        },
      )
    },
  )
  return error // null = ok
}

export async function rename(
  shipId: string,
  newName: string,
) {
  await io.emit(`ship:rename`, shipId, newName)
}

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

export async function respawn(
  id: string,
): Promise<ShipStub | null> {
  if (!(await connected())) return null

  const shipStub: ShipStub | null = await new Promise(
    (resolve) => {
      io.emit(
        `ship:respawn`,
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

export async function broadcast(
  guildId: string,
  crewMemberId: string,
  message: string,
): Promise<IOResponseReceived<number>> {
  if (!(await connected())) return { error: `` }

  const result: IOResponseReceived<number> =
    await new Promise((resolve) => {
      io.emit(
        `ship:broadcast`,
        guildId,
        crewMemberId,
        message,
        (res: IOResponseReceived<number>) => {
          resolve(res)
        },
      )
    })
  return result
}

export async function alertLevel(
  guildId: string,
  level: LogAlertLevel,
): Promise<IOResponseReceived<LogAlertLevel>> {
  if (!(await connected())) return { error: `` }

  const result: IOResponseReceived<LogAlertLevel> =
    await new Promise((resolve) => {
      io.emit(
        `ship:alertLevel`,
        guildId,
        level,
        (res: IOResponseReceived<LogAlertLevel>) => {
          resolve(res)
        },
      )
    })
  return result
}
