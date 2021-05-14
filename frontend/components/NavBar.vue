<template>
  <nav class="box">
    <nuxt-link to="/">Home</nuxt-link>

    <button v-if="userId" @click="logout">Log out</button>
    <a
      v-else
      href="https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=http%3A%2F%2Flocalhost%3A4300%2Fpostlogin&response_type=token&scope=identify%20guilds"
      >Log in</a
    >
  </nav>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    logout(this: ComponentShape) {
      this.$store.dispatch('logout')
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss" scoped>
nav.box {
  width: 100%;
  height: 3em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
