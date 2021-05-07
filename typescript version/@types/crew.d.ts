type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`

type SkillName = 'stamina'

interface BaseCrewMemberData {
  name: string
  id: string
  skills: XPData[]
  location?: CrewLocation
  stamina: number
}

interface XPData {
  skill: SkillName
  level: number
  xp: number
}
