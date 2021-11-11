<template>
  <div class="crewmembertooltip">
    <div class="tooltipheader">
      <!-- <div
        class="speciesicon"
        v-if="data.speciesId && c.species[data.speciesId]"
      >
        {{ c.species[data.speciesId].icon }}
      </div> -->
      <img
        v-if="data.discordIcon"
        class="discordicon"
        :src="data.discordIcon"
      />
      {{ data.name }}
    </div>
    <hr style="margin-bottom: 0" />

    <div class="preview flexcenter">
      <div class="iconholder">
        <ShipCrewIcon
          :crewMember="data"
          :showDiscordIcon="false"
        />
      </div>
    </div>

    <hr />

    <div class="flexcenter flexbetween">
      <div class="sub">Member for</div>
      <div>
        {{
          c.msToTimeString(Date.now() - data.joinDate, true)
        }}
      </div>
    </div>

    <hr />

    <div>
      <div
        v-for="skill in [...data.skills].sort(
          (a, b) => b.level - a.level,
        )"
        :key="data.id + skill.skill"
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
        data.stats &&
        data.stats.find(
          (s) => s.stat === 'totalContributedToCommonFund',
        )
      "
    >
      <div class="sub">💳 Contributed</div>
      <div>
        {{
          c.numberWithCommas(
            Math.round(
              data.stats.find(
                (s) =>
                  s.stat === 'totalContributedToCommonFund',
              ).amount || 0,
            ),
          )
        }}
      </div>
    </div>

    <div class="flexcenter flexbetween">
      <div class="sub">Sleep Time</div>
      <div>
        {{
          c.msToTimeString(
            (data.stats.find((s) => s.stat === 'timeInBunk')
              ? data.stats.find(
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
    isSelf() {
      return this.crewMember?.id === this.data.id
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

  & > * {
    padding-left: var(--tooltip-pad-lr);
    padding-right: var(--tooltip-pad-lr);
  }
}
.tooltipheader {
  display: flex;
  align-items: center;
}
.discordicon {
  width: 1em;
  border-radius: 50%;
  margin-right: 0.3em;
}
.speciesicon {
  margin-right: 0.1em;
  line-height: 1;
}

.preview {
  padding: 15%;
  position: relative;
  width: 100%;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 70%
  );
}
.iconholder {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview + hr {
  margin-top: 0;
}
</style>
