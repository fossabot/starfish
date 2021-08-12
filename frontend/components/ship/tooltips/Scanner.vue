<template>
  <div>
    <div>
      <b>{{ data.displayName }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>

    <hr v-if="Object.keys(data).length > 3" />

    <PillBar
      v-if="data.repair && data.maxHp"
      :mini="true"
      :value="data.repair * data.maxHp"
      :max="data.maxHp"
      class="marbotsmall"
    />
    <div v-else-if="data.repair">
      Repair: {{ c.r2(data.repair * 100) }}%
    </div>
    <div v-else-if="data.maxHp">
      Max HP: {{ c.r2(data.maxHp) }}
    </div>

    <div v-if="data.sightRange">
      Max Sight Range: {{ data.sightRange }}AU
    </div>
    <div v-if="data.shipScanRange">
      Max Ship Scan Range: {{ data.shipScanRange }}AU
    </div>
    <div v-if="data.reliability">
      Reliability: {{ data.reliability * 100 }}%
    </div>

    <div v-if="data.mass">Mass: {{ data.mass }}kg</div>

    <hr v-if="data.description" />
    <div class="sub">{{ data.description }}</div>
  </div>
</template>

<script>
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default {
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
}
</script>

<style scoped lang="scss"></style>
