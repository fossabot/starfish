<template>
  <div>
    <div>{{ data.description }}</div>
    <div>Max Broadast Range: {{ data.range }}AU</div>
    <div>Clarity Boost: {{ data.antiGarble * 100 }}AU</div>
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
