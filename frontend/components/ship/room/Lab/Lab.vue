<template>
  <Box
    class="research"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/24.webp"
  >
    <template #title
      ><span class="sectionemoji">🔬</span>Research
      Lab</template
    >

    <div class="panesection">
      <div>
        Your research speed:
        {{
          c.numberWithCommas(
            c.r2(
              (researchPerTick / c.tickInterval) *
                1000 *
                60 *
                60,
              0,
            ),
          )
        }}/hr
      </div>

      <div class="sub" v-if="upgradableItems.length > 1">
        Select your research focus below.
      </div>
    </div>

    <div class="panesection">
      <div
        class="panesubhead"
        v-if="upgradableItems.length"
        :key="
          'header' +
          upgradableItems.map((u) => u.id).join('')
        "
      >
        Available Research ({{ upgradableItems.length }})
      </div>

      <div v-if="upgradableItems.length === 0">
        <div class="mar textcenter sub">
          No research available.
        </div>
      </div>
      <div v-else>
        <Tabs
          :dropdown="true"
          :noPad="true"
          class="nopad"
          :bigTabs="true"
          :preSelect="
            upgradableItems.findIndex(
              (i) => i.id === crewMember.researchTargetId,
            )
          "
          @input="setResearchTargetId"
        >
          <Tab
            v-for="item in upgradableItems"
            :key="'upgrade' + item.id"
            :title="`Upgrade ${item.displayName} (Lv. ${item.level})`"
            :inputKey="item.id"
          >
            <ShipRoomLabResearchItem
              :data="item"
              class="padtopsmall"
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      c,
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'research'
      )
    },
    upgradableItems(): ItemStub[] {
      return (this.ship?.items ?? []).filter(
        (i: ItemStub) => i.upgradable,
      )
    },
    intellectLevel(): number {
      const passiveBoost = this.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc +
          (p.id === 'boostIntellect'
            ? p.intensity || 0
            : 0),
        0,
      )
      return (
        (this.crewMember.skills.find(
          (s) => s.skill === 'intellect',
        )?.level || 1) + passiveBoost
      )
    },
    researchPerTick(): number {
      const passiveBoostMultiplier = 1
      // +
      // ((
      //   this.crewMember as CrewMemberStub
      // ).passives?.reduce(
      //   (total, p: CrewPassiveData) =>
      //     p.id === 'boostMineSpeed'
      //       ? total + (p.intensity || 0)
      //       : total,
      //   0,
      // ) || 0) +
      // ((this.ship as ShipStub).passives?.reduce(
      //   (total, p: ShipPassiveEffect) =>
      //     p.id === 'boostMineSpeed'
      //       ? total + (p.intensity || 0)
      //       : total,
      //   0,
      // ) || 0)
      const generalBoostMultiplier =
        c.getGeneralMultiplierBasedOnCrewMemberProximity(
          this.crewMember,
          this.ship.crewMembers,
        )
      return (
        generalBoostMultiplier *
        passiveBoostMultiplier *
        c.getResearchAmountPerTickForSingleCrewMember(
          this.intellectLevel,
        )
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    setResearchTargetId(targetId: string) {
      if (targetId === this.crewMember.researchTargetId)
        return
      ;(this as any).$socket?.emit(
        'crew:researchTargetId',
        this.ship.id,
        this.crewMember.id,
        targetId,
        (res: IOResponse<true>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.research {
  position: relative;
  width: 320px;
}
</style>
