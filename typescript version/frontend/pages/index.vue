<template>
  <div class="container">
    <pre>{{ JSON.stringify(ship, null, 2) }}</pre>
  </div>
</template>

<script>
export default {
  data() {
    return { ship: null }
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      channel: '/frontend',
      persist: true,
    })
    /* Listen for events: */
    this.socket.on('hello', () => {
      console.log('hello received')
    })
    this.socket.emit('ship:get', '123', (res) => {
      if ('error' in res) return console.log(res.error)

      this.ship = res.data
    })
  },
  methods: {
    a() {
      this.ship = ''
    },
  },
}
</script>

<style></style>
