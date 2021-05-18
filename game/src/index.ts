import c from '../../common/dist'
import { Game } from './game/Game'
import './server/io'
import * as db from './db'

db.init({})

export const game = new Game()

// ----- debug -----

// const human1 = game.addHumanShip({
//   name: `human1`,
//   id: `123`,
//   faction: `green`,
//   loadout: `human_default`,
//   crewMembers: [
//     { id: 'cm1', name: 'bonzo', skills: [], stamina: 0.5 },
//     {
//       id: 'cm2',
//       name: 'bubbs',
//       skills: [{ level: 2, xp: 200, skill: 'stamina' }],
//       stamina: 0.5,
//     },
//   ],
// })

game.addAIShip({
  name: `ai1`,
  loadout: `ai_default`,
  location: [-0.5, 0.2] as CoordinatePair,
})

game.addAIShip({
  name: `ai2`,
  loadout: `ai_default`,
  location: [0.5, 0.2] as CoordinatePair,
})
