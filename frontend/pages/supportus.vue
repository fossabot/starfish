<template>
  <div class="container">
    <div class="textcolumn">
      <div class="martop">
        <h1>Support {{ c.gameName }}!</h1>
        <div>
          {{ c.gameName }} is made by
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
              Their name added to the
              <b>AI/Comet name pool</b>
            </li>
            <li>
              The <b>satisfaction</b> of supporting an indie
              developer
            </li>
            <li>My <b>sincere gratitude</b></li>
            <li>(More in-game rewards coming soon!)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
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

<style></style>
