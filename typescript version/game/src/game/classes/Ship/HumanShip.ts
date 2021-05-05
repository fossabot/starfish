import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { CrewMember } from '../CrewMember/CrewMember'
import { CombatShip } from './CombatShip'

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
      this.crewMembers.push(new CrewMember(cm, this))
    })
  }

  tick() {
    super.tick()

    this.crewMembers.forEach((cm) => cm.tick())
  }

  addCrewMember(data: BaseCrewMemberData) {
    this.crewMembers.push(new CrewMember(data, this))
  }

  removeCrewMember(id: string) {
    const index = this.crewMembers.findIndex(
      (cm) => cm.id === id,
    )

    if (index === -1) {
      c.log(
        'red',
        'attempted to remove crew member that did not exist',
        id,
        'from ship',
        this.id,
      )
      return
    }

    this.crewMembers.splice(index, 1)
  }
}
