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
) {
  if (!(await connected()))
    return `Failed to rename crew member`

  io.emit(`crew:rename`, shipId, crewId, name)
}

export async function move(
  shipId: string,
  crewId: string,
  target: CrewLocation,
) {
  if (!(await connected()))
    return `Failed to move crew member`

  io.emit(`crew:move`, shipId, crewId, target)
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
    return { error: `Failed to thrust.` }

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
) {
  if (!(await connected()))
    return `Failed to move crew member`

  io.emit(`crew:repairPriority`, shipId, crewId, target)
}
