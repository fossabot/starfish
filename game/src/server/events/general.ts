import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import type { Ship } from '../../game/classes/Ship/Ship'
import type { Game } from '../../game/Game'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
  game: Game,
) {
  socket.on(`hello`, (callback) => {
    if (!game) return
    // c.log(`hello received`)
    if (callback) callback({ data: `hello` })
  })

  // socket.on(`disconnect`, () => {
  //   if (!game) return
  // })

  socket.on(`frontend:unlistenAll`, () => {
    if (!game) return
    socket.rooms.forEach((room) => {
      if (!game) return
      socket.leave(room)
    })
  })

  socket.on(`ships:forUser:fromIdArray`, (shipIds, userId, callback) => {
    if (!game) return
    // c.log(`ships:forUser:fromIdArray`, shipIds, userId)
    const foundShips = game.ships.filter(
      (s) =>
        s.human &&
        !s.tutorial &&
        shipIds.includes(s.id) &&
        s.crewMembers.find((cm) => cm.id === userId),
    )
    if (foundShips.length) {
      const shipsAsStubs = foundShips.map((s) => s.stubify() as ShipStub)
      callback({
        data: shipsAsStubs,
      })
    } else callback({ data: [] })
  })

  socket.on(`ship:get`, (id, crewMemberId, callback) => {
    if (!game) return
    let foundShip = game.ships.find((s) => s.id === id)

    if (foundShip && crewMemberId) {
      const crewMember = foundShip.crewMembers.find(
        (c) => c.id === crewMemberId,
      )
      // return crew member tutorial ship instead if it exists
      if (
        crewMember &&
        crewMember.tutorialShipId &&
        game.ships.find((s) => s.id === crewMember.tutorialShipId)
      ) {
        // c.log(
        //   `returning tutorial ship ${crewMember.tutorialShipId} instead of requested ship`,
        // )
        id = crewMember.tutorialShipId
        foundShip = game.ships.find((s) => s.id === id)
      } else delete crewMember?.tutorialShipId // just to clean up in case they have a reference to a missing tutorial ship
    }

    if (foundShip) {
      const stub: ShipStub = foundShip.stubify()
      callback({ data: stub })
    } else callback({ error: `No ship found by the ID ${id}.` })
  })

  socket.on(`game:settings`, (callback) => {
    if (!game) return
    callback({ data: game.settings })
  })

  socket.on(`game:stats`, (callback) => {
    if (!game) return
    callback({
      data: {
        gameArea: c.numberWithCommas(c.r2(game.gameSoftArea, 0)) + `AU²`,
        ships: game.ships.length,
        planets: game.planets.length,
        zones: game.zones.length,
        caches: game.caches.length,
        playingSince: new Date(game.gameInitializedAt),
        // discordServers: game.humanShips.length,
        // players: game.humanShips.reduce(
        //   (t, hs) => t + hs.crewMembers.length,
        //   0,
        // ),
      },
    })
  })

  socket.on(`game:guildRankings`, (callback) => {
    if (!game) return
    callback({
      data: game.guildRankings,
    })
  })
}
