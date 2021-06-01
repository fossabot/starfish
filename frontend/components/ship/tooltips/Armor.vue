<template>
  <div>
    <div>{{ data.description }}</div>
    <div>
      Damage Reduction {{ data.damageReduction * 100 }}%
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
