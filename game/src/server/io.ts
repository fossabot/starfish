import c from '../../../common/dist'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

import { game } from '../'
import { Ship } from '../game/classes/Ship/Ship'
import { CombatShip } from '../game/classes/Ship/CombatShip'
import frontendEvents from './events/frontend'
import discordEvents from './events/discord'
import generalEvents from './events/general'
import combatEvents from './events/combat'
import crewEvents from './events/crew'

const httpServer = createServer()
export const io = new Server<
  IOClientEvents,
  IOServerEvents
>(httpServer, {
  cors: {
    origin: `*`,
  },
})

io.on(
  `connection`,
  (socket: Socket<IOClientEvents, IOServerEvents>) => {
    frontendEvents(socket)
    discordEvents(socket)
    generalEvents(socket)
    combatEvents(socket)
    crewEvents(socket)
  },
)

export function stubify<
  BaseType,
  StubType extends BaseStub,
>(prop: BaseType): StubType {
  const gettersIncluded: any = { ...prop }
  const proto = Object.getPrototypeOf(prop)
  const getKeyValue =
    (key: string) => (obj: Record<string, any>) =>
      obj[key]
  for (const key of Object.getOwnPropertyNames(proto)) {
    const desc = Object.getOwnPropertyDescriptor(proto, key)
    const hasGetter = desc && typeof desc.get === `function`
    if (hasGetter) {
      gettersIncluded[key] = getKeyValue(key)(prop)
    }
  }
  const circularReferencesRemoved = JSON.parse(
    JSON.stringify(
      gettersIncluded,
      (key: string, value: any) => {
        if ([`toUpdate`].includes(key)) return
        if (
          [`game`, `ship`, `attacker`, `defender`].includes(
            key,
          )
        )
          return value.id
        if ([`ships`].includes(key) && Array.isArray(value))
          return value.map((v: Ship) =>
            stubify({
              ...v,
              visible: null,
            }),
          )
        return value
      },
    ),
  ) as StubType
  circularReferencesRemoved.lastUpdated = Date.now()
  return circularReferencesRemoved
}

httpServer.listen(4200)
c.log(`io server listening on port 4200`)
