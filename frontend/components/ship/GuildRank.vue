<template>
  <Box
    class="guildrank"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/12.jpg"
  >
    <template #title>
      <span class="sectionemoji">🏆</span>Global Rankings
    </template>

    <Tabs>
      <Tab
        v-for="ranking in ship.guildRankings"
        :key="'guildRanking' + ranking.category"
        :title="c.camelCaseToWords(ranking.category)"
      >
        <div class="flex rounded">
          <div
            v-for="(score, index) in ranking.scores"
            class="scorebit"
            :style="{
              'flex-grow': score.score,
              background: c.guilds[score.guildId].color,
            }"
            :key="
              'score' + ranking.category + score.guildId
            "
            v-tooltip="
              `#${index + 1}) ${c.capitalize(
                c.guilds[score.guildId].name,
              )}: ${c.numberWithCommas(
                c.r2(score.score, 0),
              )}`
            "
          ></div>
        </div>
        <div v-if="ranking.top" class="martop">
          <h5 class="sub">Top Ships</h5>
          <ol>
            <li
              v-for="(score, index) in ranking.top"
              :key="'scoretop' + ranking.category + index"
            >
              <div class="flexbetween">
                <div
                  :style="{
                    color: score.color,
                  }"
                >
                  <b>{{ score.name }}</b>
                </div>
                <div class="sub scorenumber">
                  {{
                    c.numberWithCommas(c.r2(score.score, 0))
                  }}
                </div>
              </div>
            </li>
          </ol>
        </div>
      </Tab>
    </Tabs>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('guildRank'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'guildRank'
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.guildrank {
  width: 250px;
  position: relative;
}
.scorebit {
  height: 1em;
}
.scorenumber {
  position: relative;
  top: 0.2em;
}
</style>
