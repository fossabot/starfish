import Masonry from 'masonry-layout'

export default function({ app }, inject) {
  inject(`masonry`, Masonry)
}
