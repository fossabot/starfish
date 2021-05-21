import c from '../../../common/dist'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

import frontendEvents from './events/frontend'
import discordEvents from './events/discord'
import generalEvents from './events/general'
import combatEvents from './events/combat'
import crewEvents from './events/crew'

const httpServer = createServer()
const io = new Server<IOClientEvents, IOServerEvents>(
  httpServer,
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
    combatEvents(socket)
    crewEvents(socket)
  },
)

httpServer.listen(4200)
c.log(`io server listening on port 4200`)

export default io
