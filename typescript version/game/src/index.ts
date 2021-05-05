import c from '../../common/dist'
import { Game } from './game/Game'
import './server/io'

export const game = new Game()

game.on('tick', () => {})
