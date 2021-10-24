<template></template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

export default Vue.extend({
  data() {
    return {}
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {
    userId() {
      if (this.userId) (this as any).$router.push('/s')
    },
  },
  mounted() {
    if (this.userId) (this as any).$router.push('/s')
    else {
      const botId =
        window.location.hostname.indexOf('localhost') !== -1
          ? '723017262369472603' // j's test bot
          : `804439178636558396` // prod starfish bot
      const hostname = window.location.href.replace(
        '/login',
        '',
      )
      const postLoginPage = `${hostname}/postlogin`
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${botId}&redirect_uri=${encodeURIComponent(
        postLoginPage,
      )}&response_type=token&scope=identify%20guilds`
    }
  },
  methods: {},
})
</script>

<style></style>
