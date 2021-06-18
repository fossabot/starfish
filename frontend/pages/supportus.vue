<template>
  <div class="container">
    <NavBar />

    <div class="textcolumn">
      <div class="martop">
        <h2>Support {{ c.GAME_NAME }}!</h2>
        <div>
          {{ c.GAME_NAME }} is made by
          <a
            target="_blank"
            href="https://www.jasperstephenson.com"
            >Jasper Stephenson</a
          >
          with help from Xander Madsen and a small
          supporting cast of allies. The game has taken a
          lot of passion and hard work to make! If you like
          it and want to help me have the freedom to
          continue developing it in the future, please
          consider supporting me on
          <a
            target="_blank"
            href="https://www.patreon.com/midblue"
            >Patreon</a
          >!

          <h3>Supporters Get:</h3>
          <ul>
            <li>
              A <b>custom tagline</b> for their server's
              ship
            </li>
            <li>
              The satisfaction of supporting an indie
              developer
            </li>
            <li>My sincere gratitude</li>
            <li>(More in-game rewards coming soon!)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import c from '../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style></style>
