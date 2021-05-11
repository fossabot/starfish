import c from '../../../common/dist'
import { io, connected } from './index'

export async function add(
  shipId: string,
  data: BaseCrewMemberData,
): Promise<CrewMemberStub | null> {
  if (!(await connected())) return null

  const crewMemberStub: CrewMemberStub | null = await new Promise(
    (resolve) => {
      io.emit(
        'crew:add',
        shipId,
        data,
        ({
          data: crewMember,
          error,
        }: IOResponseReceived<CrewMemberStub>) => {
          if (!crewMember || error) {
            c.log(error)
            resolve(null)
            return
          }
          resolve(crewMember)
        },
      )
    },
  )
  return crewMemberStub
}
