interface IOServerEvents {
  ['connect']: () => void
  ['disconnect']: () => void
  [`hello`]: () => void
  ['game:tick']: ({
    deltaTime,
    game,
  }: {
    deltaTime: number
    game: GameStub
  }) => void
  [`crew:tired`]: (crewMember: CrewMemberStub) => void
  [`ship:die`]: (ship: ShipStub) => void
  ['ship:update']: ({
    id,
    props,
  }: {
    id: string
    updates: Partial<ShipStub>
  }) => void
}

interface IOClientEvents {
  [`hello`]: () => void
  [`ships:forUser:fromIdArray`]: (
    shipIds: Array,
    userId: string,
    callback: (res: IOResponse<ShipStub[]>) => void,
  ) => void
  [`ship:get`]: (
    id: string,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void

  // Client

  ['god']: () => void
  [`ship:listen`]: (
    id: string,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:unlisten`]: (id: string) => void

  ['crew:move']: (
    shipId: string,
    crewId: string,
    target: CrewLocation,
  ) => void
  ['crew:targetLocation']: (
    shipId: string,
    crewId: string,
    targetLocation: CoordinatePair,
  ) => void
  [`crew:add`]: (
    shipId: string,
    data: BaseCrewMemberData,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:buy`]: (
    shipId: string,
    crewId: string,
    cargoType: CargoType,
    amount: number,
    vendorLocation: PlanetName,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:sell`]: (
    shipId: string,
    crewId: string,
    cargoType: CargoType,
    amount: number,
    vendorLocation: PlanetName,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void

  // Discord
  ['discord']: () => void
  [`ship:create`]: (
    data: BaseHumanShipData,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void

  // [`ship:attack`]: (
  //   data: AttackRequest,
  //   callback: (res: IOResponse<TakenDamageResult>) => void,
  // ) => void
}

interface IOError {
  error: string
}
interface IOSuccess<T> {
  data: T
}
type IOResponse<T> = IOError | IOSuccess<T>

interface IOResponseReceived<T> {
  data?: T
  error?: string
}
