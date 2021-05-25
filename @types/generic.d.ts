type CoordinatePair = [number, number]

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
