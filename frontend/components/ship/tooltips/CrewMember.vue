<template>
  <div class="crewmembertooltip">
    <ShipTooltipsCrewHeader
      :data="dataToUse"
      class="header"
    />

    <hr style="margin-top: 0" />

    <div class="flexcenter flexbetween">
      <div class="sub">Member for</div>
      <div>
        {{
          c.msToTimeString(
            Date.now() - dataToUse.joinDate,
            true,
          )
        }}
      </div>
    </div>

    <hr />

    <div>
      <div
        v-for="skill in [...dataToUse.skills].sort(
          (a, b) => b.level - a.level,
        )"
        :key="dataToUse.id + skill.skill"
        class="flexcenter flexbetween"
      >
        <div class="sub">
          {{ c.capitalize(skill.skill) }}
        </div>
        <div>
          {{ skill.level }}
        </div>
      </div>
    </div>

    <hr />

    <div
      class="flexcenter flexbetween"
      v-if="
        dataToUse.stats &&
        dataToUse.stats.find(
          (s) => s.stat === 'totalContributedToCommonFund',
        )
      "
    >
      <div class="sub">💳 Contributed</div>
      <div>
        {{
          c.numberWithCommas(
            Math.round(
              dataToUse.stats.find(
                (s) =>
                  s.stat === 'totalContributedToCommonFund',
              ).amount || 0,
            ),
          )
        }}
      </div>
    </div>

    <div class="flexcenter flexbetween">
      <div class="sub">Bunk Time</div>
      <div>
        {{
          c.msToTimeString(
            (dataToUse.stats.find(
              (s) => s.stat === 'timeInBunk',
            )
              ? dataToUse.stats.find(
                  (s) => s.stat === 'timeInBunk',
                ).amount
              : 0) * 1000,
          )
        }}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    dataToUse() {
      return (
        this.ship.crewMembers.find(
          (cm) => cm.id === this.data.id,
        ) || this.data
      )
    },
    isSelf() {
      return this.crewMember?.id === this.dataToUse.id
    },
  },
})
</script>

<style scoped lang="scss">
.crewmembertooltip {
  width: 200px;
  padding: 0;
  padding-top: var(--tooltip-pad-tb);
  padding-bottom: var(--tooltip-pad-tb);

  & > *:not(.header) {
    padding-left: var(--tooltip-pad-lr);
    padding-right: var(--tooltip-pad-lr);
  }
}
</style>
