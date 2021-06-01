<template>
  <div>
    <div>{{ data.description }}</div>
    <div>Equipment Slots: {{ data.slots }}</div>
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
