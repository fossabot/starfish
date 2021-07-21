<template>
  <div v-if="c.species[data.id]">
    <div class="tooltipheader">
      {{ c.species[data.id].icon
      }}<span>{{ c.capitalize(data.id) }}</span>
    </div>
    <hr />
    <div
      v-for="passive in c.species[data.id].passives"
      class="passive"
    >
      {{
        c.basePassiveData[passive.id].toString(
          passive.intensity,
          passive.distance,
        )
      }}
    </div>
    <hr />
    <div class="sub">
      {{ c.species[data.id].description }}
    </div>
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
  mounted() {
    c.log(this.data)
  },
}
</script>

<style scoped lang="scss">
.passive {
  color: var(--success);
}
</style>
