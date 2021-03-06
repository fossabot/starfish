import c from '../../../common/dist'
import { io, connected } from './index'

export async function add(
  shipId: string,
  data: BaseCrewMemberData,
): Promise<CrewMemberStub | string> {
  if (!(await connected())) return `Failed to add crew member`

  const crewMemberStub: CrewMemberStub | string | undefined = await new Promise(
    (resolve) => {
      io.emit(
        `crew:add`,
        shipId,
        data,
        ({ data: crewMember, error }: IOResponseReceived<CrewMemberStub>) => {
          if (!crewMember || error) {
            c.log(error)
            resolve(error)
            return
          }
          resolve(crewMember)
        },
      )
    },
  )
  return crewMemberStub || `Failed to add crew member.`
}

export async function rename(
  shipId: string,
  crewId: string,
  name: string,
): Promise<IOResponse<true>> {
  if (!(await connected())) return { error: `Failed to rename crew member` }

  io.emit(`crew:rename`, shipId, crewId, name)
  return { data: true }
}

export async function setDiscordIcon(
  shipId: string,
  crewId: string,
  iconUrl: string | undefined,
): Promise<IOResponse<true>> {
  if (!(await connected()))
    return { error: `Failed to change icon of crew member` }

  io.emit(`crew:discordIcon`, shipId, crewId, iconUrl)
  return { data: true }
}

export async function move(
  shipId: string,
  crewId: string,
  target: CrewLocation,
): Promise<IOResponse<true>> {
  if (!(await connected())) return { error: `Failed to move crew member` }

  return new Promise((resolve) => {
    io.emit(`crew:move`, shipId, crewId, target, (res) => {
      resolve(res)

      if (!(`error` in res) && target === `weapons`)
        io.emit(`crew:tactic`, shipId, crewId, `aggressive`)
    })
  })
}
export async function tactic(
  shipId: string,
  crewId: string,
  tactic: CombatTactic,
): Promise<IOResponse<true>> {
  if (!(await connected()))
    return { error: `Failed to change crew member tactic` }

  return new Promise((resolve) => {
    io.emit(`crew:tactic`, shipId, crewId, tactic)
    resolve({ data: true })
  })
}

export async function leave(
  shipId: string,
  crewId: string,
): Promise<string | null> {
  const error: string | null = await new Promise((resolve) => {
    io.emit(
      `crew:leave`,
      shipId,
      crewId,
      ({ data, error }: IOResponseReceived<true>) => {
        if (error) {
          c.log(error)
          resolve(error)
          return
        }
        resolve(null)
      },
    )
  })
  return error // null = ok
}

export async function setTargetObjectOrLocation(
  shipId: string,
  crewId: string,
  targetObjectOrLocation: any,
) {
  if (!(await connected())) return { error: `Failed to set.` }

  if (Array.isArray(targetObjectOrLocation) || !targetObjectOrLocation) {
    const res: IOResponse<any> = await new Promise((resolve) => {
      io.emit(
        `crew:targetLocation`,
        shipId,
        crewId,
        targetObjectOrLocation,
        () => {
          resolve({ data: true })
        },
      )
    })
    return res
  }

  const res: IOResponse<any> = await new Promise((resolve) => {
    io.emit(`crew:targetObject`, shipId, crewId, targetObjectOrLocation, () => {
      resolve({ data: true })
    })
  })
  return res
}

export async function thrustAt(
  shipId: string,
  crewId: string,
  location: CoordinatePair,
) {
  if (!(await connected())) return { error: `Failed to thrust.` }

  const res: IOResponse<number> = await new Promise((resolve) => {
    io.emit(`crew:targetLocation`, shipId, crewId, location, () => {
      io.emit(`crew:thrust`, shipId, crewId, 1, (response) => {
        resolve(response)
      })
    })
  })
  return res
}

export async function brake(
  shipId: string,
  crewId: string,
  amount: number = 1,
) {
  if (!(await connected())) return { error: `Failed to brake.` }

  const res: IOResponse<number> = await new Promise((resolve) => {
    io.emit(`crew:brake`, shipId, crewId, amount, (response) => {
      resolve(response)
    })
  })
  return res
}

export async function repairType(
  shipId: string,
  crewId: string,
  target: RepairPriority,
): Promise<IOResponse<true>> {
  if (!(await connected())) return { error: `Failed to set repair type.` }

  io.emit(`crew:repairPriority`, shipId, crewId, target)
  return { data: true }
}

export async function mineType(
  shipId: string,
  crewId: string,
  target: MinePriorityType,
): Promise<IOResponse<MinePriorityType>> {
  if (!(await connected())) return { error: `Failed to set mine type.` }

  const res: IOResponse<MinePriorityType> = await new Promise((resolve) => {
    io.emit(`crew:minePriority`, shipId, crewId, target, (response) => {
      resolve(response)
    })
  })
  return res
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
    price: Price
  }>
> {
  if (!(await connected()))
    return {
      error: `Failed to sell: not connected to game server`,
    }

  return new Promise((resolve) => {
    io.emit(`crew:sellCargo`, shipId, crewId, type, amount, (res) => {
      resolve(res)
    })
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
    price: Price
  }>
> {
  if (!(await connected()))
    return {
      error: `Failed to buy: not connected to game server`,
    }

  return new Promise((resolve) => {
    io.emit(`crew:buyCargo`, shipId, crewId, type, amount, (res) => {
      resolve(res)
    })
  })
}

export async function contributeToCommonFund(
  shipId: string,
  crewId: string,
  amount: number,
): Promise<IOResponse<number>> {
  if (!(await connected()))
    return {
      error: `Failed to donate: not connected to game server`,
    }

  return new Promise((resolve) => {
    io.emit(`crew:contribute`, shipId, crewId, amount, (res) => {
      resolve(res)
    })
  })
}
