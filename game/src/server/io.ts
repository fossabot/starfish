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
import { createServer as createHTTPSServer } from 'https'
import isDocker from 'is-docker'

let serverConfig = {}
if (!isDocker()) {
  serverConfig = {
    key: fs.readFileSync(
      path.resolve(`./ssl/localhost.key`),
    ),
    cert: fs.readFileSync(
      path.resolve(`./ssl/localhost.crt`),
    ),
  }
} else {
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
    ca: fs.readFileSync(
      path.resolve(
        `/etc/letsencrypt/live/www.starfish.cool/chain.pem`,
      ),
    ),
    requestCert: true,
  }
}

const httpsServer = createHTTPSServer(serverConfig)
const io = new socketServer<IOClientEvents, IOServerEvents>(
  httpsServer,
  {
    cors: {
      origin: `*`,
    },
  },
)

io.on(
  `connection`,
  (socket: Socket<IOClientEvents, IOServerEvents>) => {
    frontendEvents(socket)
    discordEvents(socket)
    generalEvents(socket)
    crewEvents(socket)
    itemEvents(socket)
    adminEvents(socket)
  },
)

httpsServer.listen(4200)
c.log(`io server listening on port 4200`)

export default io
