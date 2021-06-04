<template>
  <div>
    <div>
      <b>{{ data.displayName }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>
    <hr />
    <div>Max Range: {{ data.range }}AU</div>
    <div>Max Damage: {{ data.damage }}</div>
    <div>Charge Required: {{ data.baseCooldown }}</div>
    <div v-if="data.cooldownRemaining">
      Charge Progress:
      {{
        c.r2(data.baseCooldown - data.cooldownRemaining, 0)
      }}
    </div>
    <hr />
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
