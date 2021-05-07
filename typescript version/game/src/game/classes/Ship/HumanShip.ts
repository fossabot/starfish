import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { CrewMember } from '../CrewMember/CrewMember'
import { CombatShip } from './CombatShip'

import { membersIn } from './addins/crew'
import { stubify } from '../../../server/io'

export class HumanShip extends CombatShip {
  readonly human: boolean
  readonly id: string
  crewMembers: CrewMember[] = []

  constructor(data: BaseHumanShipData, game: Game) {
    super(data, game)
    this.human = true
    this.id = data.id
    //* id matches discord guildId here

    data.crewMembers.forEach((cm) => {
      this.addCrewMember(cm)
    })
  }

  tick() {
    this.crewMembers.forEach((cm) => cm.tick())
    this.toUpdate.crewMembers = this.crewMembers.map((cm) =>
      stubify<CrewMember, CrewMemberStub>(cm),
    )
    super.tick()
  }

  addCrewMember(data: BaseCrewMemberData) {
    const cm = new CrewMember(data, this)
    this.crewMembers.push(cm)
    c.log('Added crew member', cm.name, 'to', this.name)
  }

  removeCrewMember(id: string) {
    const index = this.crewMembers.findIndex(
      (cm) => cm.id === id,
    )

    if (index === -1) {
      c.log(
        'red',
        'Attempted to remove crew member that did not exist',
        id,
        'from ship',
        this.id,
      )
      return
    }

    this.crewMembers.splice(index, 1)
  }

  membersIn = membersIn
}
