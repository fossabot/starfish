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

export async function channelUpdate(
  guildId: string,
  channelType: GameChannelType,
  channelId: string,
) {
  if (!(await connected())) return null

  io.emit(
    `ship:channelUpdate`,
    guildId,
    channelType,
    channelId,
  )
}
