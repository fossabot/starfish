import c from '../../common/dist'
import { Game } from './game/Game'

const lastCommit = require(`git-last-commit`)
lastCommit.getLastCommit((err, commit) => {
  if (!err)
    c.log(
      `blue`,
      `Latest commit:`,
      commit?.subject,
      `(${new Date(parseInt(commit?.committedOn) * 1000).toLocaleString()})`,
    )
})

async function startGame() {
  let game = new Game({ ioPort: 4200 })
  await game.loadGameDataFromDb()
  game.startGame()
}
startGame()
