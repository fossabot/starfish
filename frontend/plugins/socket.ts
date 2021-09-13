import c from '../../common/src'
import io from 'socket.io-client'

const socketAddress =
  process.env.NODE_ENV === `development`
    ? `http://localhost:4200`
    : `https://www.starfish.cool:4200`
// c.log(
//   `initializing frontend socket connection at`,
//   socketAddress,
// )
const socket = io(socketAddress, { secure: true, rejectUnauthorized: false })

// // test
// socket.emit(`hello`)

export default function ({ app }, inject) {
  inject(`socket`, socket)
}
