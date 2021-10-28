import c from '../../../common/dist'
import { Server as socketServer, Socket } from 'socket.io'
import fs from 'fs'
import path from 'path'

import type { Game } from '../game/Game'

import frontendEvents from './events/frontend'
import discordEvents from './events/discord'
import generalEvents from './events/general'
import crewEvents from './events/crew'
import itemEvents from './events/items'
import cosmeticsEvents from './events/cosmetics'
import adminEvents from './events/admin'
import {
  createServer as createHTTPSServer,
  ServerOptions,
} from 'https'
import { createServer as createHTTPServer } from 'http'
import isDocker from 'is-docker'

require(`events`).captureRejections = true

function spawnIo(
  game: Game,
  options: { port?: number } = { port: 4200 },
) {
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

  const io = new socketServer<
    IOClientEvents,
    IOServerEvents
  >(webServer, {
    cors: {
      origin: `*`,
      methods: [`GET`, `POST`],
    },
  })

  io.on(
    `connection`,
    (socket: Socket<IOClientEvents, IOServerEvents>) => {
      socket[Symbol.for(`nodejs.rejection`)] = (err) => {
        socket.emit(`disconnectFromServer`)
      }
      frontendEvents(socket, game)
      discordEvents(socket, game)
      generalEvents(socket, game)
      crewEvents(socket, game)
      itemEvents(socket, game)
      cosmeticsEvents(socket, game)
      adminEvents(socket, game)
    },
  )

  webServer.listen(options.port)
  // c.log(
  //   `green`,
  //   `io server listening on port ${options.port}`,
  // )

  return io
}

export default spawnIo
