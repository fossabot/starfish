type CrewLocation =
  | `bunk`
  | `cockpit`
  | `repair`
  | `weapons`

type SkillName =
  | `piloting`
  | `munitions`
  | `mechanics`
  | `linguistics`

interface BaseCrewMemberData {
  name: string
  id: string
  skills?: XPData[]
  location?: CrewLocation
  stamina?: number
  inventory?: Cargo[]
  credits?: number
}

interface XPData {
  skill: SkillName
  level: number
  xp: number
}
