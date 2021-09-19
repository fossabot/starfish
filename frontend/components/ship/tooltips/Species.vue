<template>
  <div v-if="c.species[data.id]">
    <div class="tooltipheader">
      {{ c.species[data.id].icon
      }}<span>{{ c.capitalize(data.id) }}</span>
    </div>
    <hr />
    <div
      v-for="passive in c.species[data.id].passives"
      class="success"
    >
      {{ c.basePassiveData[passive.id].toString(passive) }}
    </div>
    <hr />
    <div class="sub">
      {{ c.species[data.id].description }}
    </div>
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
  mounted() {},
})
</script>

<style scoped lang="scss"></style>
