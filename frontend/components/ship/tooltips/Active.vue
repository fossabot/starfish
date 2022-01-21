<template>
  <div>
    <div class="tooltipheader">
      {{ activeData.displayName }}
    </div>
    <hr />
    <div>
      {{ activeData.description(data, crewMember.level) }}
    </div>

    <div class="sub" v-if="data.unlockLevel && !data.usable">
      Unlocks at level {{ data.unlockLevel }}
    </div>

    <div class="martopsmall"></div>
    <div class="sub" v-if="data.usable && activeData.captain">
      Captain-only ability.
    </div>
    <div
      class="sub"
      v-if="
        !data.unlockLevel &&
        ![
          'seeTrailColors',
          'broadcastRangeCargoPrices',
          'moveAllCrewMembersToRepair',
        ].includes(data.id)
      "
    >
      Base amplification factor:
      <span>
        {{ activeData.displayIntensity(data.intensity) }}
      </span>
      <br />
      Scales with your level.
    </div>
    <div
      class="sub"
      v-if="
        data.usable && !crewMember.bottomedOutOnStamina && !cooldownRemaining
      "
    >
      Click to activate!
    </div>
    <template v-if="data.usable">
      <hr />
      <div class="flexbetween">
        <div class="sub">Cooldown</div>
        <div>
          {{
            c.msToTimeString(
              Math.max(activeData.cooldown, c.crewActiveBaseGlobalCooldown),
            )
          }}
        </div>
      </div>
      <div v-if="cooldownRemaining" class="flexbetween">
        <div class="sub marrightsmall">Cooldown remaining</div>
        <div>{{ c.msToTimeString(cooldownRemaining) }}</div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c, cooldownRemaining: 0 }
  },
  computed: {
    ...mapState(['tooltip', 'crewMember', 'lastUpdated']),
    activeData(): CrewActiveData {
      return c.crewActives[(this.data as CrewActive).id]
    },
    lastActiveUse(): number {
      return this.crewMember?.lastActiveUse || 0
    },
  },
  watch: {
    lastActiveUse() {
      this.updateCooldown()
    },
    lastUpdated() {
      if (this.tooltip === this.data) this.updateCooldown()
    },
  },
  mounted() {
    this.updateCooldown()
  },
  methods: {
    updateCooldown() {
      this.cooldownRemaining = Math.max(
        0,
        c.crewActiveBaseGlobalCooldown -
          (Date.now() - (this.crewMember?.lastActiveUse || 0)),
        this.activeData.cooldown -
          (Date.now() - ((this.data as CrewActive).lastUsed || 0)),
      )
    },
  },
})
</script>

<style scoped lang="scss"></style>
