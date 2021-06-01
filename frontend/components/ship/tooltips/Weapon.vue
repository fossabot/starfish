<template>
  <div>
    <div>{{ data.description }}</div>
    <div>Max Range: {{ data.range }}AU</div>
    <div>Max Damage: {{ data.damage }}</div>
    <div>Charge Required: {{ data.baseCooldown }}</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: { data: {} },
  data() {
    return {}
  },
  computed: {
    ...mapState([]),
  },
}
</script>

<style scoped lang="scss"></style>
