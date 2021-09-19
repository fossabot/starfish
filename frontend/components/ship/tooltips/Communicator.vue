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

    <div v-if="data.range">
      Max Broadast Range: {{ data.range }}AU
    </div>
    <div v-if="data.antiGarble">
      Clarity Boost: {{ data.antiGarble * 100 }}%
    </div>
    <div v-if="data.reliability">
      Reliability: {{ data.reliability * 100 }}%
    </div>

    <div v-if="data.mass">
      Mass: {{ c.numberWithCommas(data.mass) }}kg
    </div>

    <hr v-if="data.passives && data.passives.length" />
    <div v-for="passive in data.passives" class="success">
      {{
        c.basePassiveData[passive.id].toString(
          passive.intensity,
          passive,
        )
      }}
    </div>

    <hr v-if="data.description" />
    <div class="sub">{{ data.description }}</div>
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
    ...mapState([]),
  },
})
</script>

<style scoped lang="scss"></style>
