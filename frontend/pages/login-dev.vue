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
      if (this.userId) (this as any).$router.push('/s')
    },
  },
  mounted() {
    if (this.userId) (this as any).$router.push('/s')
    else {
      const hostname = `localhost`
      const postLoginPage = `http://${hostname}/postlogin`
      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${
        process.env.BOT_ID
      }&redirect_uri=${encodeURIComponent(
        postLoginPage,
      )}&response_type=token&scope=identify%20guilds`
    }
  },
  methods: {},
})
</script>

<style></style>
