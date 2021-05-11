<template>
  <div class="container">
    <div v-if="errorMessage">
      <div>
        {{ errorMessage }}
      </div>
      <a
        href="https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=http%3A%2F%2Flocalhost%3A4300%2Fpostlogin&response_type=token&scope=identify%20guilds"
        >Try Again</a
      >
    </div>
  </div>
</template>

<script lang="ts">
import * as storage from '../assets/scripts/storage'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {
      errorMessage: '',
      userData: null,
      userGuilds: null,
    }
  },
  computed: {
    ...mapState([]),
  },
  async mounted(this: ComponentShape) {
    const fragment = new URLSearchParams(
      window.location.hash.slice(1),
    )
    const [accessToken, tokenType] = [
      fragment.get('access_token'),
      fragment.get('token_type'),
    ]

    if (!accessToken) {
      return (this.errorMessage =
        'Failed to log in through Discord.')
    } else {
      const p = [
        this.getUserData(tokenType, accessToken),
        this.getUserGuilds(tokenType, accessToken),
      ]
      await Promise.all(p)
      if (this.userData && this.userGuilds) {
        this.loadUserGameGuilds()
      } else {
        this.errorMessage =
          'Failed to fetch user data from Discord.'
      }
    }
  },
  methods: {
    getUserData(
      this: ComponentShape,
      tokenType: string,
      accessToken: string,
    ) {
      return new Promise<void>((resolve) => {
        fetch('https://discord.com/api/users/@me', {
          headers: {
            authorization: `${tokenType} ${accessToken}`,
          },
        })
          .then((result) => result.json())
          .then((response) => {
            this.userData = response
            resolve()
          })
          .catch((e) => {
            this.errorMessage = e
            resolve()
          })
      })
    },

    getUserGuilds(
      this: ComponentShape,
      tokenType: string,
      accessToken: string,
    ) {
      return new Promise<void>((resolve) => {
        fetch('https://discord.com/api/users/@me/guilds', {
          headers: {
            authorization: `${tokenType} ${accessToken}`,
          },
        })
          .then((result) => result.json())
          .then((guildRes) => {
            this.userGuilds = guildRes.map(
              (g: any) => g?.id,
            )
            resolve()
          })
          .catch((e) => {
            this.errorMessage = e
            resolve()
          })
      })
    },

    loadUserGameGuilds(this: ComponentShape) {
      this.$socket.emit(
        'ships:forUser:fromIdArray',
        this.userGuilds,
        this.userData.id,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            return (this.errorMessage = res.error)
          } else {
            const shipIds = res.data.map(
              (s: ShipStub) => s.id,
            )
            storage.set('userId', this.userData.id)
            storage.set('shipIds', JSON.stringify(shipIds))
            this.$store.commit('set', {
              userId: this.userData.id,
              shipIds,
            })
            this.$router.push('/s')
          }
        },
      )
    },
  },
}
</script>

<style></style>
