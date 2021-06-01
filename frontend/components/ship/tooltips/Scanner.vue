<template>
  <div>
    <div>{{ data.description }}</div>
    <div>Max Sight Range: {{ data.sightRange }}AU</div>
    <div>
      Max Ship Scan Range: {{ data.shipScanRange }}AU
    </div>
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
