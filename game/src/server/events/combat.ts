import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  // socket.on(`ship:attack`, (data, callback) => {
  //   const foundShip = game.ships.find(
  //     (s) => s.id === data.id,
  //   ) as CombatShip
  //   const enemyShip = game.ships.find(
  //     (s) => s.id === data.enemyId,
  //   ) as CombatShip
  //   const weapon = foundShip.weapons.find(
  //     (w) => w.id === data.weaponId,
  //   )
  //   if (!foundShip || !enemyShip) {
  //     c.log(`Call to attack nonexistant ship`)
  //     callback({
  //       error: `No ship found! ${data.id} ${data.enemyId}`,
  //     })
  //   } else if (
  //     !(`attack` in foundShip) ||
  //     !(`attack` in enemyShip)
  //   ) {
  //     c.log(`Call to attack pacifist ship`)
  //     callback({
  //       error: `Ship not combat ready! ${data.id} ${data.enemyId}`,
  //     })
  //   } else if (!weapon) {
  //     c.log(`Call to attack without valid weapon id`)
  //     callback({
  //       error: `No weapon! ${data.weaponId}`,
  //     })
  //   } else {
  //     const res = foundShip.attack(enemyShip, weapon)
  //     callback({
  //       data: res,
  //     })
  //   }
  // })
}
