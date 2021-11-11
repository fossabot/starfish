interface IOServerEvents {
  [`connect`]: () => void
  [`disconnectFromServer`]: () => void
  [`hello`]: (
    callback?: (res: IOResponse<`hello`>) => void,
  ) => void
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
  [`ship:reload`]: () => void
  [`ship:message`]: (
    id: string,
    message: string | RichLogContent,
    channelType?: GameChannelType,
    notify?: boolean,
  ) => void
  [`ship:resetView`]: () => void
  [`ship:forwardTo`]: (id: string) => void

  // user
  [`user:reloadShips`]: () => void
}

interface IOClientEvents {
  [`hello`]: (
    callback?: (res: IOResponse<`hello`>) => void,
  ) => void

  // admin events
  [`game:adminCheck`]: (
    adminId: string,
    password: string,
    callback: (res: boolean) => void,
  ) => void
  [`admin:map`]: (
    adminId: string,
    password: string,
    callback: (res: IOResponse<AdminVisibleData>) => void,
  ) => void
  [`game:setSettings`]: (
    adminId: string,
    password: string,
    settings: Partial<AdminGameSettings>,
  ) => void
  [`admin:respawnShip`]: (
    adminId: string,
    password: string,
    shipId: string,
  ) => void
  [`admin:deleteShip`]: (
    adminId: string,
    password: string,
    shipId: string,
  ) => void
  [`admin:achievementToShip`]: (
    adminId: string,
    password: string,
    shipId: string,
    achievement: string,
  ) => void
  [`admin:deleteCrewMember`]: (
    adminId: string,
    password: string,
    shipId: string,
    crewMemberId: string,
  ) => void
  [`game:save`]: (adminId: string, password: string) => void
  [`game:pause`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:unpause`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:backups`]: (
    adminId: string,
    password: string,
    callback: (res: IOResponse<string[]>) => void,
  ) => void
  [`game:resetToBackup`]: (
    adminId: string,
    password: string,
    backupId: string,
  ) => void
  [`game:messageAll`]: (
    adminId: string,
    password: string,
    message: LogContent,
  ) => void
  [`game:resetAllPlanets`]: (
    adminId: string,
    password: string,
    callback?: () => void,
  ) => void
  [`game:resetAllComets`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:reLevelAllPlanets`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:reLevelAllPlanetsOfType`]: (
    adminId: string,
    password: string,
    planetType: PlanetType,
  ) => void
  [`game:reLevelOnePlanet`]: (
    adminId: string,
    password: string,
    planetId: string,
  ) => void
  [`game:levelUpOnePlanet`]: (
    adminId: string,
    password: string,
    planetId: string,
  ) => void
  [`admin:give`]: (
    adminId: string,
    password: string,
    shipId: string,
    cargo: Cargo[],
  ) => void
  [`admin:kill`]: (
    adminId: string,
    password: string,
    shipId: string,
  ) => void
  [`admin:kit`]: (
    adminId: string,
    password: string,
    shipId: string,
  ) => void
  [`admin:stamina`]: (
    adminId: string,
    password: string,
    shipId: string,
  ) => void
  [`game:resetHomeworlds`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:resetAllZones`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:resetAllCaches`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:resetAllAIShips`]: (
    adminId: string,
    password: string,
    callback?: () => void,
  ) => void
  [`game:resetAllShips`]: (
    adminId: string,
    password: string,
    callback?: () => void,
  ) => void
  [`game:resetAllAttackRemnants`]: (
    adminId: string,
    password: string,
  ) => void
  [`game:shipList`]: (
    adminId: string,
    password: string,
    humanOnly: boolean,
    callback: (
      res: IOResponse<
        {
          name: string
          id: string
          guildId?: GuildId
          crewMemberCount: number
          isTutorial: string | false
        }[]
      >,
    ) => void,
  ) => void
  [`admin:move`]: (
    adminId: string,
    password: string,
    type: string,
    id: string,
    coordinates: CoordinatePair,
    callback: (res: IOResponse<boolean>) => void,
  ) => void
  [`admin:delete`]: (
    adminId: string,
    password: string,
    type: string,
    id: string,
    callback: (res: IOResponse<boolean>) => void,
  ) => void

  // general events
  [`ships:forUser:fromIdArray`]: (
    shipIds: Array,
    userId: string,
    callback: (res: IOResponse<ShipStub[]>) => void,
  ) => void
  [`ship:get`]: (
    id: string,
    crewMemberId: string,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`game:settings`]: (
    callback: (res: IOResponse<AdminGameSettings>) => void,
  ) => void
  [`frontend:unlistenAll`]: () => void

  // client
  [`god`]: () => void
  [`ship:basics`]: (
    id: string,
    callback: (res: IOResponse<Partial<ShipStub>>) => void,
  ) => void
  [`ship:listen`]: (
    id: string,
    crewMemberId: string | false,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void

  // user
  [`user:listen`]: (userId: string) => void

  [`crew:setSpecies`]: (
    shipId: string,
    crewId: string,
    speciesId: SpeciesId,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:toTutorial`]: (
    shipId: string,
    crewId: string,
  ) => void
  [`crew:move`]: (
    shipId: string,
    crewId: string,
    target: CrewLocation,
    callback?: (res: IOResponse<true>) => void,
  ) => void
  [`crew:targetLocation`]: (
    shipId: string,
    crewId: string,
    targetLocation: CoordinatePair,
    callback?: (res: IOResponse<CoordinatePair>) => void,
  ) => void
  [`crew:leave`]: (
    shipId: string,
    crewId: string,
    callback: (res: IOResponse<true>) => void,
  ) => void
  [`crew:tactic`]: (
    shipId: string,
    crewId: string,
    tactic: CombatTactic,
  ) => void
  [`crew:repairPriority`]: (
    shipId: string,
    crewId: string,
    priority: RepairPriority,
  ) => void
  [`crew:minePriority`]: (
    shipId: string,
    crewId: string,
    priority: MinePriorityType,
    callback?: (res: IOResponse<MinePriorityType>) => void,
  ) => void
  [`crew:attackTarget`]: (
    shipId: string,
    crewId: string,
    targetId: string,
  ) => void
  [`crew:fullyRestedTarget`]: (
    shipId: string,
    crewId: string,
    target: CrewLocation,
  ) => void
  [`crew:itemTarget`]: (
    shipId: string,
    crewId: string,
    targetId: ItemType | null,
  ) => void
  [`crew:drop`]: (
    shipId: string,
    crewId: string,
    cargoId: CargoId | `credits`,
    amount: number,
    message: string,
    callback: (
      res: IOResponse<CacheStub | undefined>,
    ) => void,
  ) => void
  [`crew:buyCargo`]: (
    shipId: string,
    crewId: string,
    cargoId: CargoId,
    amount: number,
    callback: (
      res: IOResponse<{
        cargoId: CargoId
        amount: number
        price: Price
      }>,
    ) => void,
  ) => void
  [`crew:sellCargo`]: (
    shipId: string,
    crewId: string,
    cargoId: CargoId,
    amount: number,
    callback: (
      res: IOResponse<{
        cargoId: CargoId
        amount: number
        price: Price
      }>,
    ) => void,
  ) => void
  [`crew:buyRepair`]: (
    shipId: string,
    crewId: string,
    hp: number,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:buyPassive`]: (
    shipId: string,
    crewId: string,
    id: CrewPassiveId,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:contribute`]: (
    shipId: string,
    crewId: string,
    amount: number,
    callback?: (res: IOResponse<number>) => void,
  ) => void
  [`crew:donateToPlanet`]: (
    shipId: string,
    crewId: string,
    amount: number,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`ship:donateCosmeticCurrencyToPlanet`]: (
    shipId: string,
    crewId: string,
    amount: number,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`crew:donateCosmeticCurrencyToPlanet`]: (
    shipId: string,
    crewId: string,
    amount: number,
    callback: (res: IOResponse<CrewMemberStub>) => void,
  ) => void
  [`crew:thrust`]: (
    shipId: string,
    crewId: string,
    charge: number,
    callback: (res: IOResponse<number>) => void,
  ) => void
  [`crew:brake`]: (
    shipId: string,
    crewId: string,
    charge: number,
    callback: (res: IOResponse<number>) => void,
  ) => void
  [`crew:reactToOrder`]: (
    shipId: string,
    crewId: string,
    reaction: string,
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

  [`ship:acceptContract`]: (
    shipId: string,
    crewId: string,
    contractId: string,
    callback: (res: IOResponse<Contract>) => void,
  ) => void
  [`ship:abandonContract`]: (
    shipId: string,
    crewId: string,
    contractId: string,
    callback: (res: IOResponse<true>) => void,
  ) => void

  [`ship:buyTagline`]: (
    shipId: string,
    crewId: string,
    tagline: string,
    callback: (res: IOResponse<true>) => void,
  ) => void
  [`ship:buyHeaderBackground`]: (
    shipId: string,
    crewId: string,
    headerBackground: HeaderBackground,
    callback: (res: IOResponse<true>) => void,
  ) => void

  [`ship:joinGuild`]: (
    shipId: string,
    crewId: string,
    guildId: GuildId,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:swapChassis`]: (
    shipId: string,
    crewId: string,
    chassisId: ChassisId,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void
  [`ship:advanceTutorial`]: (shipId: string) => void
  [`ship:skipTutorial`]: (shipId: string) => void
  [`ship:headerBackground`]: (
    shipId: string,
    crewId: string,
    bgId: string,
    callback: (res: IOResponse<string>) => void,
  ) => void
  [`ship:tagline`]: (
    shipId: string,
    crewId: string,
    tagline: string,
    callback: (res: IOResponse<string>) => void,
  ) => void
  [`ship:withdraw`]: (
    shipId: string,
    crewId: string,
    amount: number,
    callback: (res: IOResponse<boolean>) => void,
  ) => void
  [`ship:deposit`]: (
    shipId: string,
    crewId: string,
    amount: number,
    callback: (res: IOResponse<boolean>) => void,
  ) => void
  [`ship:orders`]: (
    shipId: string,
    crewId: string,
    orders: ShipOrders,
    callback: (res: IOResponse<boolean>) => void,
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
  [`ship:guildData`]: (
    shipId: string,
    guildData: { guildName: string; guildIcon: string },
    callback: (res: IOResponse<boolean>) => void,
  ) => void
  [`ship:kickMember`]: (
    shipId: string,
    crewMemberId: string,
    callback: (res: IOResponse<string>) => void,
  ) => void
  [`ship:rename`]: (
    shipId: string,
    name: string,
    callback: (res: IOResponse<string>) => void,
  ) => void

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
  [`crew:discordIcon`]: (
    shipId: string,
    crewId: string,
    url?: string,
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
