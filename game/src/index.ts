if (process.env.NODE_ENV === `production`)
  require(`newrelic`)

import c from '../../common/dist'

const lastCommit = require(`git-last-commit`)
lastCommit.getLastCommit((err, commit) => {
  if (!err)
    c.log(
      `blue`,
      `Latest commit:`,
      commit?.subject,
      `(${new Date(
        parseInt(commit?.committedOn) * 1000,
      ).toLocaleString()})`,
    )
})

import { Game } from './game/Game'

async function startGame() {
  let game = new Game({ ioPort: 4200 })
  await game.loadGameDataFromDb()
  game.startGame()
}
startGame()
