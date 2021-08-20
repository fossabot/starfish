import c from '../../common/src'
import io from 'socket.io-client'

const socketAddress =
  process.env.NODE_ENV === `development`
    ? `http://localhost:4200`
    : `http://game:4200`
c.log(
  `initializing frontend socket connection at`,
  socketAddress,
)
const socket = io(socketAddress)

// test
socket.emit(`hello`)

export default function({ app }, inject) {
  inject(`socket`, socket)
}
