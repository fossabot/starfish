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
import motionEvents from './events/motion'
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
    motionEvents(socket)
    crewEvents(socket)
  },
)

export function stubify<
  BaseType,
  StubType extends BaseStub
>(prop: BaseType): StubType {
  const circularReferencesRemoved = JSON.parse(
    JSON.stringify(prop, (key: string, value: any) => {
      if ([`toUpdate`].includes(key)) return
      if ([`game`, `ship`].includes(key)) return value.id
      if ([`ships`].includes(key) && Array.isArray(value))
        return value.map((v: Ship) =>
          stubify({
            ...v,
            visible: null,
          }),
        )
      return value
    }),
  ) as StubType
  circularReferencesRemoved.lastUpdated = Date.now()
  return circularReferencesRemoved
}

httpServer.listen(4200)
c.log('io server listening on port 4200')
