<template>
  <div>
    <div>{{ data.description }}</div>
    <div>
      Thrust Amplification: {{ data.thrustAmplification }}x
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
