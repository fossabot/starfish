import c from '../../../common/dist'
import { Server, Socket } from 'socket.io'
import fs from 'fs'

import frontendEvents from './events/frontend'
import discordEvents from './events/discord'
import generalEvents from './events/general'
import crewEvents from './events/crew'
import itemEvents from './events/items'
import https from 'https'

const privateKey = fs.readFileSync(process.env.SERVER_PRIVATE_KEY, 'utf8')
const certificate = fs.readFileSync(process.env.SERVER_CERTIFICATE, 'utf8')
const credentials = {
    key: privateKey, 
    cert: certificate, 
}
const httpsServer = https.createServer(credentials)
const io = new Server<IOClientEvents, IOServerEvents>(
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
  },
)

httpsServer.listen(4200)
c.log(`io server listening on port 4200`)

export default io
