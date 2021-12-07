<template>
  <span>
    <span
      :class="{
        success: (passive.intensity || 0) >= 0,
        warning: (passive.intensity || 0) < 0,
      }"
    >
      {{ c.crewPassives[passive.id].description(passive) }}
    </span>
    <span
      class="sub"
      :class="{ nowrap: sourceText.length < 30 }"
      v-if="passive.data && passive.data.source"
    >
      {{ sourceText }}
    </span>
    <div class="sub" v-if="timeRemaining">
      <span class="fade"
        >({{
          c.msToTimeString(timeRemaining)
        }}
        remaining)</span
      >
    </div>
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    passive: {
      required: true,
      type: Object as PropType<CrewPassiveData>,
    },
  },
  data() {
    let timeRemaining = 0
    return { c, timeRemaining }
  },
  computed: {
    ...mapState(['lastUpdated']),
    sourceText(): string {
      const s = this.passive.data?.source
      if (!s) return ''
      if (s === 'secondWind') return 'Second Wind'
      if (s === 'permanent') return 'Permanent'
      if (s === 'lowMorale') return 'Space Madness'
      if (s === 'highMorale') return 'High Morale'

      return s.speciesId
        ? `${c.capitalize(
            c.species[s.speciesId].singular,
          )} species`
        : s.planetName
        ? `Planet ${s.planetName}`
        : s.item
        ? `${
            c.items[s.item?.type]?.[s.item?.id].displayName
          }`
        : s.chassisId
        ? `${c.items.chassis[s.chassisId].displayName}`
        : s.crewActive
        ? `${
            c.crewActives[s.crewActive.activeId].displayName
          }`
        : ''
    },
  },
  watch: {
    lastUpdated() {
      this.recalculateRemaining()
    },
  },
  mounted() {
    this.recalculateRemaining()
  },
  methods: {
    recalculateRemaining() {
      if (!this.passive.until) this.timeRemaining = 0
      else
        this.timeRemaining = this.passive.until - Date.now()
    },
  },
})
</script>

<style lang="scss" scoped></style>
