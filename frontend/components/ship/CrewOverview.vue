<template>
  <Box
    class="crewoverview"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/15.webp"
  >
    <template #title>
      <span class="sectionemoji">🫂</span>Crew
    </template>

    <div class="crewoverviewholder panesection">
      <div
        v-for="cm in sortedCrewMembers"
        :key="'cm' + cm.id"
        class="crewmemberholder"
      >
        <ShipCrewIcon
          :crewMember="cm"
          :captain="ship.captain === cm.id"
          :showTagline="true"
        />
      </div>
    </div>

    <div
      class="sortpicker panesection flexcenter"
      v-if="dev || ship.crewMembers.length > 1"
    >
      <div>Sort by:</div>
      <Tabs
        :dropdown="true"
        v-model="sortBy"
        :noPad="true"
        class="flexgrow"
        ><Tab title="Activity"></Tab>
        <Tab title="Seniority"></Tab>
        <Tab
          :title="`Contributed 💳${c.capitalize(
            c.baseCurrencyPlural,
          )}`"
        ></Tab>
        <Tab title="Bunk Time"></Tab>
        <Tab
          v-for="skill in ship.crewMembers[0].skills"
          :key="'skillrank' + skill.skill"
          :title="
            c.capitalize(c.camelCaseToWords(skill.skill))
          "
        ></Tab>
      </Tabs>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, sortBy: undefined }
  },
  computed: {
    ...mapState(['dev', 'userId', 'ship', 'crewMember']),
    show(): boolean {
      return (
        this.ship &&
        // this.ship.crewMembers.length > 1 &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('crewOverview'))
      )
    },
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'crewOverview'
      )
    },
    sortedCrewMembers(): CrewMemberStub[] {
      const sortBy =
        (this.sortBy || '').toLowerCase() || 'activity'
      if (sortBy === 'activity')
        return [...this.ship.crewMembers].sort(
          (a: CrewMemberStub, b) => {
            return (b.lastActive || 0) - (a.lastActive || 0)
          },
        )

      if (sortBy === 'seniority') {
        return [...this.ship.crewMembers].sort(
          (a, b) => a.seniority - b.seniority,
        )
      }

      if (
        sortBy === `contributed 💳${c.baseCurrencyPlural}`
      )
        return [...this.ship.crewMembers].sort(
          (a: CrewMemberStub, b) =>
            (b.stats.find(
              (s) =>
                s.stat === 'totalContributedToCommonFund',
            )?.amount || 0) -
            (a.stats.find(
              (s) =>
                s.stat === 'totalContributedToCommonFund',
            )?.amount || 0),
        )

      if (sortBy === `naps`)
        return [...this.ship.crewMembers].sort(
          (a: CrewMemberStub, b) =>
            (b.stats.find((s) => s.stat === 'timeInBunk')
              ?.amount || 0) -
            (a.stats.find((s) => s.stat === 'timeInBunk')
              ?.amount || 0),
        )

      return [...this.ship.crewMembers].sort(
        (a: CrewMemberStub, b) =>
          (b.skills.find((s) => s.skill === sortBy)
            ?.level || 0) -
          (a.skills.find((s) => s.skill === sortBy)
            ?.level || 0),
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.crewoverview {
  width: 250px;
  position: relative;
}

.sortpicker {
  padding-top: 0;
  padding-bottom: 0;
  margin: 0 0 -10px 0;
  white-space: nowrap;

  *:first-child {
    margin-right: 1em;
  }
}

.crewoverviewholder {
  max-height: 300px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 0.2em;
}

.crewmemberholder {
  width: 100%;
}
</style>
