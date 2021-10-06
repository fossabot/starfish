<template>
  <div class="container">
    <div class="textcolumn">
      <h1 class="title marbot">
        <img src="/images/logo.svg" class="logo" />
        <span>{{ c.gameName }}</span>
      </h1>

      <h2 class="marbotsmall martop">
        Welcome to the alpha test of {{ c.gameName }}!
      </h2>

      <div class="marbot">
        <div class="marbotsmall">
          This is an early version of a new kind of game —
          one that happens in real-time, spans across the
          web and Discord, and enables teamwork in a whole
          new way.
        </div>
        <div class="marbot" v-if="!userId">
          To play, you will need:
          <ul>
            <li>
              Admin powers in a
              <a href="https://discord.com/" target="_blank"
                >Discord</a
              >
              server
            </li>
            <li>A web browser</li>
            <li>
              <b>Bonus:</b> Friends in your server who want
              to join your ship!
            </li>
          </ul>
        </div>
        <div class="marbot">
          This is a game made by two people in our free
          time, so please be patient as we work out the
          kinks.
        </div>
        <div class="marbot">
          During the alpha, I'm looking for
          <nuxt-link to="/feedback">feedback</nuxt-link>
          around the gameplay, plus
          <nuxt-link to="/feedback/bugreport"
            >bug reports</nuxt-link
          >
          for any bugs you find, but more than anything
          <nuxt-link to="/feedback/storytime"
            >I want to hear your stories</nuxt-link
          >. What happened in-game that felt memorable or
          epic? What left an impression, or made you feel a
          strong emotion?
        </div>
        <div class="marbot">
          Thank you so much for playing! Feel free to play
          as much or as little as you like, with as many
          ships as you like, with as many crew members as
          you like.
        </div>
      </div>

      <div v-if="!userId">Log in to get started:</div>

      <nuxt-link
        to="/login"
        v-if="!userId"
        class="button big whitebackground"
        >Log In With Discord</nuxt-link
      >

      <nuxt-link
        v-else
        to="/s"
        class="button big whitebackground"
        >My Ship</nuxt-link
      >
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  align-items: center;
  font-size: 3rem;
  margin-top: 3em;
}
.logo {
  width: 2em;
  margin-right: 0.3em;
}
</style>
