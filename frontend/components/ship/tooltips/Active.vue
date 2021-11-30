<template>
  <div>
    <div class="tooltipheader">
      {{ activeData.displayName }}
    </div>
    <hr />
    <div>
      {{ activeData.description(data) }}
    </div>
    <div class="sub martopsmall" v-if="!cooldownRemaining">
      Click to activate!
    </div>
    <hr />
    <div class="flexbetween">
      <div class="sub">Cooldown</div>
      <div>
        {{
          c.msToTimeString(
            Math.max(
              activeData.cooldown,
              c.crewActiveBaseGlobalCooldown,
            ),
          )
        }}
      </div>
    </div>
    <div v-if="cooldownRemaining" class="flexbetween">
      <div class="sub">Cooldown remaining</div>
      <div>{{ c.msToTimeString(cooldownRemaining) }}</div>
    </div>
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
    ...mapState(['tooltip', 'crewMember']),
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
  },
  mounted() {
    this.updateCooldown()
  },
  methods: {
    updateCooldown() {
      this.cooldownRemaining = Math.max(
        0,
        c.crewActiveBaseGlobalCooldown -
          (Date.now() -
            (this.crewMember?.lastActiveUse || 0)),
        this.activeData.cooldown -
          (Date.now() -
            ((this.data as CrewActive).lastUsed || 0)),
      )
      if (this.tooltip === this.data)
        setTimeout(this.updateCooldown, 1000)
    },
  },
})
</script>

<style scoped lang="scss"></style>
