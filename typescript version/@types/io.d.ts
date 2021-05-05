interface IOServerEvents {
  [`hello`]: () => void
  [`ship:died`]: (ship: ShipStub) => void
}

interface IOClientEvents {
  [`hello`]: () => void

  [`ship:list`]: (
    callback: (res: IOResponse<ShipStub[]>) => void,
  ) => void

  [`ship:get`]: (
    id: string,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void

  [`ship:create`]: (
    data: BaseHumanShipData,
    callback: (res: IOResponse<ShipStub>) => void,
  ) => void

  [`ship:thrust`]: (
    data: ThrustRequest,
    callback: (res: IOResponse<ThrustResult>) => void,
  ) => void

  [`ship:attack`]: (
    data: AttackRequest,
    callback: (res: IOResponse<TakenDamageResult>) => void,
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
