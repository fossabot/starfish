import c from '../../common/dist'
import io from 'socket.io-client'

const socketAddress =
  process.env.NODE_ENV === `development`
    ? process.env.IS_DOCKER
      ? `https://localhost:4200`
      : `http://localhost:4200`
    : `https://www.starfish.cool:4200`
// c.log(
//   `initializing frontend socket connection at`,
//   socketAddress,
// )
const socket = io.io(socketAddress, {
  secure: true,
  rejectUnauthorized: false,
})

export default function ({ app }, inject) {
  inject(`socket`, socket)
}
