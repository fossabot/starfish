<template>
  <div class="container">
    <transition name="fade">
      <div v-if="show" class="textcolumn">
        <div>
          If this page doesn't automatically advance to the
          ship page, try turning off any privacy extensions
          or adblockers. (<b>PrivacyBadger</b> has broken
          this before.)
        </div>
        <div>
          The error is likely logged in your browser's
          console. If the issue persists, please share a bug
          report.
        </div>
        <div>
          If you think you've fixed the problem,
          <a :href="loginUrl">click here to try again</a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'
import * as storage from '../assets/scripts/storage'
import { mapState } from 'vuex'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return {
      errorMessage: '',
      userData: null,
      userGuilds: null,
      show: false,
    }
  },
  computed: {
    ...mapState(['userId']),
    loginUrl() {
      const hostname = window.location.href.replace(
        /\/login.*/g,
        '',
      ) //`www.starfish.cool`
      const postLoginPage = `${hostname}/postlogin`
      return `https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=${encodeURIComponent(
        postLoginPage,
      )}&response_type=token&scope=identify%20guilds`
    },
  },
  watch: {
    userId() {
      if (this.userId) this.$router.push('/s')
    },
  },
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
      c.log('Failed to log in through Discord.')
      this.errorMessage =
        'Failed to log in through Discord.'
      return
    } else {
      storage.set('tokenType', tokenType)
      storage.set('accessToken', accessToken)
      // await this.$nextTick()
      this.$store.dispatch('logIn')
    }
  },
  methods: {},
})
</script>

<style></style>
