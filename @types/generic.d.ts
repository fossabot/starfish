type CoordinatePair = [number, number]

interface Reference {
  type: string
  id?: string
  name?: string
  guildId?: GuildId
  speciesId?: SpeciesId
  tagline?: string
  headerBackground?: string
  level?: number
}

interface ResponseWithMessage {
  message?: string
}

interface HasLocation {
  location: CoordinatePair
  [key: string]: any
}

interface HasMassAndLocation {
  mass: number
  location: CoordinatePair
  [key: string]: any
}

interface HasMassAndLocationAndVelocity {
  mass: number
  location: CoordinatePair
  velocity: CoordinatePair
  [key: string]: any
}
