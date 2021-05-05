import c from '../../../common/dist'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

import { game } from '../'
import { Ship } from '../game/classes/Ship/Ship'
import { CombatShip } from '../game/classes/Ship/CombatShip'

const httpServer = createServer()
const io = new Server<IOClientEvents, IOServerEvents>(
  httpServer,
  {
    cors: {
      origin: `*`,
    },
  },
)

const ioFrontend = io.of(`/frontend`)
ioFrontend.on(
  `connection`,
  (socket: Socket<IOClientEvents, IOServerEvents>) => {
    c.log(`Frontend client connected to io`)
    socket.emit(`hello`)

    socket.on(`ship:get`, (id, callback) => {
      const foundShip = game.ships.find((s) => s.id === id)
      if (foundShip) {
        const stub = stubify<Ship, ShipStub>(foundShip)
        callback({
          data: stub,
        })
      } else
        callback({ error: `No ship found by that ID.` })
    })
  },
)

const ioDiscord = io.of(`/discord`)
ioDiscord.on(
  `connection`,
  (socket: Socket<IOClientEvents, IOServerEvents>) => {
    c.log(`Discord process connected to io`)
    socket.emit(`hello`)

    socket.on(`ship:get`, (id, callback) => {
      const foundShip = game.ships.find((s) => s.id === id)
      if (foundShip) {
        const stub = stubify<Ship, ShipStub>(foundShip)
        callback({
          data: stub,
        })
      } else
        callback({ error: `No ship found by that ID.` })
    })

    socket.on(`ship:create`, (data, callback) => {
      const foundShip = game.ships.find(
        (s) => s.id === data.id,
      )
      if (foundShip) {
        c.log(
          `Call to create existing ship, returning existing`,
        )
        const stub = stubify<Ship, ShipStub>(foundShip)
        callback({
          data: stub,
        })
      } else {
        const ship = game.addHumanShip(data)
        const stub = stubify<Ship, ShipStub>(ship)
        callback({
          data: stub,
        })
      }
    })

    socket.on(`ship:thrust`, (data, callback) => {
      const foundShip = game.ships.find(
        (s) => s.id === data.id,
      )
      if (!foundShip) {
        c.log(`Call to thrust nonexistant ship`)
        callback({
          error: `No ship found by id ${data.id}.`,
        })
      } else {
        const res = foundShip.thrust(
          data.angle,
          data.powerPercent,
        )
        callback({
          data: res,
        })
      }
    })

    socket.on(`ship:attack`, (data, callback) => {
      const foundShip = game.ships.find(
        (s) => s.id === data.id,
      ) as CombatShip
      const enemyShip = game.ships.find(
        (s) => s.id === data.enemyId,
      ) as CombatShip
      const weapon = foundShip.weapons.find(
        (w) => w.id === data.weaponId,
      )
      if (!foundShip || !enemyShip) {
        c.log(`Call to attack nonexistant ship`)
        callback({
          error: `No ship found! ${data.id} ${data.enemyId}`,
        })
      } else if (
        !(`attack` in foundShip) ||
        !(`attack` in enemyShip)
      ) {
        c.log(`Call to attack pacifist ship`)
        callback({
          error: `Ship not combat ready! ${data.id} ${data.enemyId}`,
        })
      } else if (!weapon) {
        c.log(`Call to attack without valid weapon id`)
        callback({
          error: `No weapon! ${data.weaponId}`,
        })
      } else {
        const res = foundShip.attack(enemyShip, weapon)
        callback({
          data: res,
        })
      }
    })
  },
)

function stubify<Base, Stub>(prop: Base): Stub {
  const circularReferencesRemoved = JSON.parse(
    JSON.stringify(prop, (key: string, value: any) => {
      if ([`game`, `ship`].includes(key)) return
      return value
    }),
  ) as Stub
  return circularReferencesRemoved
}

httpServer.listen(4200)
