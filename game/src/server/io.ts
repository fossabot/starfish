import c from '../../../common/dist'
import { Server as socketServer, Socket } from 'socket.io'
import fs from 'fs'
import path from 'path'

import frontendEvents from './events/frontend'
import discordEvents from './events/discord'
import generalEvents from './events/general'
import crewEvents from './events/crew'
import itemEvents from './events/items'
import adminEvents from './events/admin'
import {
  createServer as createHTTPSServer,
  ServerOptions,
} from 'https'
import { createServer as createHTTPServer } from 'http'
import isDocker from 'is-docker'

require(`events`).captureRejections = true

import type { Game } from '../game/Game'
export let game: Game | undefined

export function linkGame(g: Game) {
  game = g
}

let serverConfig: ServerOptions = {}
let webServer
if (isDocker()) {
  if (process.env.NODE_ENV !== `production`) {
    serverConfig = {
      key: fs.readFileSync(
        path.resolve(`./ssl/localhost.key`),
      ),
      cert: fs.readFileSync(
        path.resolve(`./ssl/localhost.crt`),
      ),
    }
  } else {
    c.log(`green`, `Launching production server...`)
    serverConfig = {
      key: fs.readFileSync(
        path.resolve(
          `/etc/letsencrypt/live/www.starfish.cool/privkey.pem`,
        ),
      ),
      cert: fs.readFileSync(
        path.resolve(
          `/etc/letsencrypt/live/www.starfish.cool/fullchain.pem`,
        ),
      ),
      ca: [
        fs.readFileSync(
          path.resolve(
            `/etc/letsencrypt/live/www.starfish.cool/chain.pem`,
          ),
        ),
      ],
      // requestCert: true
    }
  }
  webServer = createHTTPSServer(serverConfig)
} else webServer = createHTTPServer(serverConfig)

// * test endpoint to check if the server is running and accessible
webServer.on(`request`, (req, res) => {
  res.end(`ok`)
})

const io = new socketServer<IOClientEvents, IOServerEvents>(
  webServer,
  {
    cors: {
      origin: `*`,
      methods: [`GET`, `POST`],
    },
  },
)

io.on(
  `connection`,
  (socket: Socket<IOClientEvents, IOServerEvents>) => {
    socket[Symbol.for(`nodejs.rejection`)] = (err) => {
      socket.emit(`disconnectFromServer`)
    }
    frontendEvents(socket)
    discordEvents(socket)
    generalEvents(socket)
    crewEvents(socket)
    itemEvents(socket)
    adminEvents(socket)
  },
)

webServer.listen(4200)
c.log(`green`, `io server listening on port 4200`)
export default io
