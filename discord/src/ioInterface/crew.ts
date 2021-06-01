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
