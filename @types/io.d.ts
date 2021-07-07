interface IOServerEvents {
  [`connect`]: () => void
  [`disconnect`]: () => void
  [`hello`]: () => void
  [`game:tick`]: ({
    deltaTime,
    game,
  }: {
    deltaTime: number
    game: GameStub
  }) => void
  [`ship:update`]: ({
    id,
    props,
  }: {
    id: string
    updates: Partial<ShipStub>
  }) => void
  [`ship:message`]: (
    id: string,
    message: string,
    channelType?: GameChannelType,
  ) => void
  [`ship:resetView`]: () => void
}

interface IOClientEvents {
  [`hello`]: () => void
  [`game:save`]: () => void
  [`ships:forUser:fromIdArray`]: (
    shipIds: Array,
    userId: string,
    callback: (res: IOResponse<ShipStub[]>) => void,
  ) => void
  [`ship:get`]: (
    id: string,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void

  // client
  [`god`]: () => void
  [`ship:basics`]: (
    id: string,
    callback: (res: IOResponse<Partial<ShipStub>>) => void,
  ) => void
  [`ship:listen`]: (
    id: string,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:unlisten`]: (id: string) => void

  [`crew:move`]: (
    shipId: string,
    crewId: string,
    target: CrewLocation,
  ) => void
  [`crew:targetLocation`]: (
    shipId: string,
    crewId: string,
    targetLocation: CoordinatePair,
  ) => void
  [`crew:tactic`]: (
    shipId: string,
    crewId: string,
    tactic: Tactic,
  ) => void
  [`crew:repairPriority`]: (
    shipId: string,
    crewId: string,
    priority: RepairPriority,
  ) => void
  [`crew:attackTarget`]: (
    shipId: string,
    crewId: string,
    targetId: string,
  ) => void
  [`crew:itemTarget`]: (
    shipId: string,
    crewId: string,
    targetId: ItemType | null,
  ) => void
  [`crew:drop`]: (
    shipId: string,
    crewId: string,
    cargoType: CargoType | `credits`,
    amount: number,
    message: string,
    callback: (res: IOResponse<CacheStub>) => void,
  ) => void
  [`crew:buyCargo`]: (
    shipId: string,
    crewId: string,
    cargoType: CargoType,
    amount: number,
    vendorLocation: PlanetName,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:sellCargo`]: (
    shipId: string,
    crewId: string,
    cargoType: CargoType,
    amount: number,
    vendorLocation: PlanetName,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:buyRepair`]: (
    shipId: string,
    crewId: string,
    hp: number,
    vendorLocation: PlanetName,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:buyPassive`]: (
    shipId: string,
    crewId: string,
    type: CrewPassiveType,
    vendorLocation: PlanetName,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:contribute`]: (
    shipId: string,
    crewId: string,
    amount: number,
  ) => void
  [`crew:thrust`]: (
    shipId: string,
    crewId: string,
    charge: number,
    callback: (
      res: IOResponse<{
        crewMember: CrewMemberStub
        ship: ShipStub
      }>,
    ) => void,
  ) => void
  [`crew:brake`]: (
    shipId: string,
    crewId: string,
    charge: number,
    callback: (
      res: IOResponse<{
        crewMember: CrewMemberStub
        ship: ShipStub
      }>,
    ) => void,
  ) => void
  [`ship:redistribute`]: (
    shipId: string,
    crewId: string,
    amount: number,
  ) => void
  [`ship:buyItem`]: (
    shipId: string,
    crewId: string,
    itemType: ItemType,
    itemId: ItemId,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:sellItem`]: (
    shipId: string,
    crewId: string,
    itemType: ItemType,
    itemId: ItemId | ChassisId,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:swapChassis`]: (
    shipId: string,
    crewId: string,
    chassisId: ChassisId,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:advanceTutorial`]: (shipId: string) => void
  [`ship:headerBackground`]: (
    shipId: string,
    crewId: string,
    bgId: string,
    callback: (res: IOResponse<String>) => void,
  ) => void
  [`ship:tagline`]: (
    shipId: string,
    crewId: string,
    tagline: string,
    callback: (res: IOResponse<String>) => void,
  ) => void

  // discord
  [`discord`]: () => void
  [`ship:create`]: (
    data: BaseHumanShipData,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:destroy`]: (
    shipId: string,
    callback: (res: IOResponse<string>) => void,
  ) => void
  [`ship:respawn`]: (
    id: string,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:broadcast`]: (
    shipId: string,
    crewMemberId: string,
    message: string,
    callback: (res: IOResponse<number>) => void,
  ) => void
  [`ship:alertLevel`]: (
    id: string,
    level: LogAlertLevel,
    callback: (res: IOResponse<LogAlertLevel>) => void,
  ) => void
  [`ship:setCaptain`]: (
    shipId: string,
    crewMemberId: string,
    callback: (res: IOResponse<string>) => void,
  ) => void
  [`ship:kickMember`]: (
    shipId: string,
    crewMemberId: string,
    callback: (res: IOResponse<string>) => void,
  ) => void
  [`ship:rename`]: (shipId: string, name: string) => void

  [`crew:add`]: (
    shipId: string,
    data: BaseCrewMemberData,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:rename`]: (
    shipId: string,
    crewId: string,
    name: string,
  ) => void
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
