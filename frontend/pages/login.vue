<template> </template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {}
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {
    userId() {
      if (this.userId) this.$router.push('/s')
    },
  },
  mounted() {
    if (this.userId) this.$router.push('/s')
    else {
      let hostname = window.location.hostname
      if (hostname.indexOf('localhost') === 0)
        hostname = `${hostname}:${window.location.port}`
      else if (hostname.indexOf('www.') !== 0)
        hostname = 'www.' + hostname
      const postLoginPage = `http://${hostname}/postlogin`
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=${encodeURIComponent(
        postLoginPage,
      )}&response_type=token&scope=identify%20guilds`
    }
  },
  methods: {},
})
</script>

<style></style>
