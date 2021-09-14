<template></template>

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
      const botId = `804439178636558396`
      const hostname = `www.starfish.cool`
      const postLoginPage = `https://${hostname}/postlogin`
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${botId}&redirect_uri=${encodeURIComponent(
        postLoginPage,
      )}&response_type=token&scope=identify%20guilds`
    }
  },
  methods: {},
})
</script>

<style></style>
