import c from '../../../common/dist'
import { io, connected } from './index'

export async function add(
  shipId: string,
  data: BaseCrewMemberData,
): Promise<CrewMemberStub | string> {
  if (!(await connected()))
    return `Failed to add crew member`

  const crewMemberStub:
    | CrewMemberStub
    | string
    | undefined = await new Promise((resolve) => {
    io.emit(
      `crew:add`,
      shipId,
      data,
      ({
        data: crewMember,
        error,
      }: IOResponseReceived<CrewMemberStub>) => {
        if (!crewMember || error) {
          c.log(error)
          resolve(error)
          return
        }
        resolve(crewMember)
      },
    )
  })
  return crewMemberStub || `Failed to add crew member.`
}

export async function rename(
  shipId: string,
  crewId: string,
  name: string,
): Promise<IOResponse<true>> {
  if (!(await connected()))
    return { error: `Failed to rename crew member` }

  io.emit(`crew:rename`, shipId, crewId, name)
  return { data: true }
}

export async function move(
  shipId: string,
  crewId: string,
  target: CrewLocation,
): Promise<IOResponse<true>> {
  if (!(await connected()))
    return { error: `Failed to move crew member` }

  io.emit(`crew:move`, shipId, crewId, target)

  if (target === `weapons`)
    io.emit(`crew:tactic`, shipId, crewId, `aggressive`)
  return { data: true }
}

export async function thrustInCurrentDirection(
  shipId: string,
  crewId: string,
) {
  if (!(await connected()))
    return { error: `Failed to thrust.` }

  const res: IOResponse<number> = await new Promise(
    (resolve) => {
      io.emit(
        `crew:thrustInCurrentDirection`,
        shipId,
        crewId,
        (response) => {
          resolve(response)
        },
      )
    },
  )
  return res
}

export async function brake(
  shipId: string,
  crewId: string,
) {
  if (!(await connected()))
    return { error: `Failed to brake.` }

  const res: IOResponse<number> = await new Promise(
    (resolve) => {
      io.emit(
        `crew:brake`,
        shipId,
        crewId,
        1,
        (response) => {
          resolve(response)
        },
      )
    },
  )
  return res
}

export async function repairType(
  shipId: string,
  crewId: string,
  target: RepairPriority,
): Promise<IOResponse<true>> {
  if (!(await connected()))
    return { error: `Failed to move crew member.` }

  io.emit(`crew:repairPriority`, shipId, crewId, target)
  return { data: true }
}

export async function sell(
  shipId: string,
  crewId: string,
  type: CargoId,
  amount: number,
  planetId: string,
): Promise<
  IOResponse<{
    cargoId: CargoId
    amount: number
    price: number
  }>
> {
  if (!(await connected()))
    return {
      error: `Failed to sell: not connected to game server`,
    }

  return new Promise((resolve) => {
    io.emit(
      `crew:sellCargo`,
      shipId,
      crewId,
      type,
      amount,
      planetId,
      (res) => {
        resolve(res)
      },
    )
  })
}

export async function buy(
  shipId: string,
  crewId: string,
  type: CargoId,
  amount: number,
  planetId: string,
): Promise<
  IOResponse<{
    cargoId: CargoId
    amount: number
    price: number
  }>
> {
  if (!(await connected()))
    return {
      error: `Failed to buy: not connected to game server`,
    }

  return new Promise((resolve) => {
    io.emit(
      `crew:buyCargo`,
      shipId,
      crewId,
      type,
      amount,
      planetId,
      (res) => {
        resolve(res)
      },
    )
  })
}
