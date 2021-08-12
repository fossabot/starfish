<template>
  <Box
    class="factionrank"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/12.jpg"
  >
    <template #title>
      <span class="sectionemoji">🏆</span>Global Rankings
    </template>

    <div
      class="panesection"
      v-for="ranking in ship.factionRankings"
      :key="'factionRanking' + ranking.category"
    >
      <div class="panesubhead">{{ ranking.category }}</div>
      <div class="flex rounded">
        <div
          v-for="(score, index) in ranking.scores"
          class="scorebit"
          :style="{
            'flex-grow': score.score,
            background: score.faction.color,
          }"
          :key="
            'score' + ranking.category + score.faction.id
          "
          v-tooltip="
            `#${index + 1}) ${c.capitalize(
              score.faction.name,
            )}: ${c.r2(score.score, 0)}`
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
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('factionRank'))
      )
    },
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'factionRank'
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.factionrank {
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
