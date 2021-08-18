import io from 'socket.io-client'
const socket = io(`starfish.cool:4200`)

export default function({ app }, inject) {
  inject(`socket`, socket)
}
