import c from '../../common/dist'
c.log(c.GAME_NAME)
import { Game } from './game/Game'

const g = new Game()

const human1 = g.addHumanShip({
  name: `human1`,
  id: `123`,
  planet: `Origin`,
  faction: `green`,
  loadout: `human_default`,
})

const ai1 = g.addAIShip({
  name: `ai1`,
  loadout: `ai_default`,
  planet: `Hera`,
})

// g.identify()
// c.log(g.ships)
// c.log(ai1)
