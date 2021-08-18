<template>
  <div class="container">
    <transition name="fade">
      <div v-if="show">
        <NavBar />

        <div>
          If it's not working, try turning off any privacy
          extensions or adblockers.
        </div>
        <div>
          PrivacyBadger has broken this before.
        </div>
        <a
          href="https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=http%3A%2F%2Fstarfish.cool%2Fpostlogin&response_type=token&scope=identify%20guilds"
          >Try Again</a
        >
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as storage from '../assets/scripts/storage'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      errorMessage: '',
      userData: null,
      userGuilds: null,
      show: false,
    }
  },
  computed: {},
  async mounted() {
    setTimeout(() => {
      this.show = true
    }, 4000)
    const fragment = new URLSearchParams(
      window.location.hash.slice(1),
    )
    const [accessToken, tokenType] = [
      fragment.get('access_token'),
      fragment.get('token_type'),
    ]

    if (!accessToken || !tokenType) {
      this.errorMessage =
        'Failed to log in through Discord.'
      return
    } else {
      storage.set('tokenType', tokenType)
      storage.set('accessToken', accessToken)
      this.$store.dispatch('logIn')
    }
  },
  methods: {},
})
</script>

<style></style>
