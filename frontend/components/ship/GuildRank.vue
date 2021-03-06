<template>
  <Box
    class="guildrank"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/12.webp"
  >
    <template #title> <span class="sectionemoji">🏆</span>Guild Rankings </template>

    <Tabs>
      <Tab
        v-for="ranking in rankings"
        :key="'guildRanking' + ranking.category"
        :title="c.capitalize(c.camelCaseToWords(ranking.category))"
      >
        <div class="flex rounded">
          <div
            v-for="(score, index) in ranking.scores"
            class="scorebit"
            :style="{
              'flex-grow': score.score,
              background:
                score.guildId === 'noGuild'
                  ? 'var(--noguild)'
                  : c.guilds[score.guildId].color,
            }"
            :key="'score' + ranking.category + score.guildId"
            v-tooltip="
              `#${index + 1}) ${
                score.guildId === 'noGuild'
                  ? 'No Guild'
                  : c.capitalize(c.guilds[score.guildId].name)
              }: ${c.numberWithCommas(c.r2(score.score, 0))}`
            "
          ></div>
        </div>
        <div v-if="ranking.top" class="martop">
          <h5 class="sub">
            Top {{ ranking.category === "control" ? "Factions" : "Ships" }}
          </h5>
          <ol>
            <li
              v-for="(score, index) in ranking.top"
              :key="'scoretop' + ranking.category + index"
              :style="{
                color: score.color,
              }"
            >
              <div class="flexbetween">
                <div>
                  <b>{{ score.name }}</b>
                </div>
                <div class="sub scorenumber">
                  {{ c.numberWithCommas(c.r2(score.score, 0)) }}
                </div>
              </div>
            </li>
          </ol>

          <template
            v-if="
              ship &&
              ranking.top &&
              ['netWorth', 'members'].includes(ranking.category) &&
              !ranking.top.find((r) => r.name === ship.name)
            "
          >
            <hr class="half marginauto" />
            <ul>
              <li>
                <div class="flexbetween">
                  <div
                    :style="{
                      color: !ship.guildId
                        ? 'var(--noguild)'
                        : c.guilds[ship.guildId].color,
                    }"
                  >
                    <b>{{ ship.name }}</b>
                  </div>
                  <div class="sub scorenumber">
                    {{
                      c.numberWithCommas(
                        c.r2(
                          ranking.category === "netWorth"
                            ? ship.stats.find((s) => s.stat === "netWorth")
                              ? ship.stats.find((s) => s.stat === "netWorth").amount
                              : 0
                            : ranking.category === "members"
                            ? ship.crewMembers.length
                            : 0,
                          0
                        )
                      )
                    }}
                  </div>
                </div>
              </li>
            </ul>
          </template>
        </div>
      </Tab>
    </Tabs>
  </Box>
</template>

<script lang="ts">
import Vue from "vue";
import c from "../../../common/dist";
import { mapState } from "vuex";

export default Vue.extend({
  props: { loadSelf: { type: Boolean, default: false } },
  data() {
    return { c, loadedRankings: {} };
  },
  computed: {
    ...mapState(["userId", "ship", "crewMember"]),
    show(): boolean {
      return (
        (this as any).$route.path !== "/s" ||
        !this.ship ||
        !this.ship.tutorial?.currentStep
      );
    },
    highlight(): boolean {
      return this.ship?.tutorial?.currentStep?.highlightPanel === "guildRank";
    },
    rankings(): any {
      return this.ship?.guildRankings || this.loadedRankings;
    },
  },
  watch: {},
  mounted() {
    if (this.loadSelf) this.loadRankings();
  },
  methods: {
    async loadRankings() {
      await new Promise(async (r) => {
        (this as any).$socket?.emit("game:guildRankings", (res) => {
          if ("error" in res) return;
          this.loadedRankings = res.data;
        });
      });
    },
  },
});
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
