type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`

interface BaseCrewMemberData {
  name: string
  id: string
  skills: XPData[]
  location?: CrewLocation
  stamina: number
}

interface XPData {
  skill: string
  level: number
  xp: number
}
