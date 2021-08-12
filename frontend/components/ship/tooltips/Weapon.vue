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

    <div v-if="data.cooldownRemaining !== undefined">
      Charge:
      {{
        Math.floor(
          ((data.baseCooldown - data.cooldownRemaining) /
            data.baseCooldown) *
            100,
        )
      }}%
      <ProgressBar
        :micro="true"
        :percent="
          (data.baseCooldown - data.cooldownRemaining) /
            data.baseCooldown
        "
        :dangerZone="-1"
      />
    </div>
    <div v-if="data.range">
      Max Range: {{ data.range }}AU
    </div>
    <div v-if="data.damage">
      Base Damage: {{ data.damage }}
    </div>
    <div v-if="data.baseCooldown">
      Charge Required: {{ data.baseCooldown }}
    </div>
    <div v-if="data.cooldownRemaining">
      Charge Progress:
      {{
        c.r2(data.baseCooldown - data.cooldownRemaining, 0)
      }}
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
