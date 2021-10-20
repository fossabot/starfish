type ScanType =
  | `humanShip`
  | `aiShip`
  | `planet`
  | `comet`
  | `cache`
  | `attackRemnant`
  | `trail`
  | `zone`

interface GameDbOptions {
  hostname?: string
  port?: number
  dbName?: string
  username?: string
  password?: string
}
