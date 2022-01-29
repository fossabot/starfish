<template>
  <div class="container masonrycontainer" ref="container">
    <Box style="width: 200px" :minimizable="false">
      <div class="flexcenter flexcolumn">
        <img
          src="/images/logo.svg"
          style="width: 5em"
          class="logo padbotsmall padtopsmall"
        />
        <h1 class="marnone padbot">
          <span>{{ c.gameName }}</span>
        </h1>
      </div>
    </Box>

    <Box style="width: 500px" bgImage="/images/paneBackgrounds/20.webp">
      <template #title> <span class="sectionemoji">👋</span>Welcome </template>

      <div class="panesection textcolumn">
        <div class="bold">Welcome to the alpha test of {{ c.gameName }}!</div>
        <div>
          This is an early version of a new kind of game — one that happens in
          real-time, spans across the web and Discord, and enables teamwork in a
          whole new way.
        </div>
        <div>
          This is a game made by two people in our free time, so please be
          patient as we work out the kinks.
        </div>
        <div>
          During the alpha, I'm looking for feedback around the gameplay, bug
          reports, and also I want to hear your stories! What happened in-game
          that felt memorable or epic? What left an impression, or made you feel
          a strong emotion? Let me know on the
          <a :href="c.supportServerLink" target="_blank">Discord Server</a>!
        </div>
        <hr />
        <div>
          Thank you so much for playing! Feel free to play as much or as little
          as you like, with as many ships as you like, with as many crew members
          as you like.
        </div>
      </div>
    </Box>

    <Box
      style="width: 200px"
      :minimizable="false"
      bgImage="/images/paneBackgrounds/21.webp"
    >
      <template #title> <span class="sectionemoji">▶️</span>Play </template>

      <div class="panesection">
        <nuxt-link
          to="/login"
          v-if="!userId"
          class="button fullwidth flexcenter"
          style="min-height: 4em"
          ><span>Log In With Discord</span></nuxt-link
        >

        <nuxt-link
          v-else
          to="/s"
          class="button fullwidth flexcenter"
          style="min-height: 4em"
          ><span>My Ship</span></nuxt-link
        >
      </div>
    </Box>

    <Box style="width: 700px" :overlayTitle="true">
      <img src="/images/home/intro.jpg" style="width: 100%" />
    </Box>

    <Box style="width: 250px" bgImage="/images/paneBackgrounds/19.webp">
      <template #title>
        <span class="sectionemoji">📊</span>Game Stats
      </template>

      <div class="panesection flexcolumn">
        <div
          class="flexbetween"
          v-for="(s, index) in Object.entries(stats)"
          :key="'stat' + index"
        >
          <div class="fade">
            {{ c.capitalize(c.camelCaseToWords(s[0])) }}
          </div>
          <div>
            <template v-if="s[0] === 'playingSince'">
              {{ new Date(s[1]).toLocaleDateString() }}
            </template>
            <template v-else>{{ s[1] }}</template>
          </div>
        </div>
      </div>
    </Box>

    <Box style="width: 200px" bgImage="/images/paneBackgrounds/22.webp">
      <template #title>
        <span class="sectionemoji">ℹ️</span>Game Info
      </template>

      <div class="panesection textcolumn">
        <div>
          <nuxt-link to="/about">About</nuxt-link>
        </div>
        <div>
          <nuxt-link to="/howtoplay">How To Play</nuxt-link>
        </div>
        <div>
          <a :href="c.supportServerLink" target="_blank">Discord Server</a>
        </div>
        <div>
          <nuxt-link to="/patchnotes">Patch Notes</nuxt-link>
        </div>
        <div>
          <nuxt-link to="/supportus">Support Us</nuxt-link>
        </div>
      </div>
    </Box>

    <ShipGuildRank :loadSelf="true" />
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'
import { mapState } from 'vuex'
import FreeMase from '../assets/scripts/freemase'

export default Vue.extend({
  async asyncData(context) {
    let stats
    await new Promise(async (resolve) => {
      context.$socket?.emit('game:stats', (res) => {
        if ('error' in res) return resolve()
        stats = res.data
        resolve()
      })
    })

    return { stats }
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted() {
    new FreeMase(this.$refs.container, {
      centerX: true,
    })
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.container {
  max-width: 1000px;
}
</style>
