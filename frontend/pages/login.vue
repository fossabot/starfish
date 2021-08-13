<template> </template>

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
  watch: {
    userId(this: ComponentShape) {
      if (this.userId) this.$router.push('/s')
    },
  },
  mounted(this: ComponentShape) {
    if (this.userId) this.$router.push('/s')
    else {
      const postLoginPage = 'http://0.0.0.0:80/postlogin'
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=${encodeURIComponent(
        postLoginPage,
      )}&response_type=token&scope=identify%20guilds`
    }
  },
  methods: {},
}
</script>

<style></style>
