<template>
  <div class="inventory panesection">
    <div class="panesubhead">Cargo</div>
    <div>
      💳Credits:
      {{ Math.round(crewMember.credits * 1000) / 1000 }}
    </div>
    <div v-for="item in inventory" :key="'inv' + item.type">
      {{ c.capitalize(item.type) }}:
      {{ Math.round(item.amount * 1000) / 1000 }} tons
    </div>
  </div>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['crewMember']),
    inventory(this: ComponentShape) {
      return this.crewMember?.inventory
        .filter((i: Cargo) => i.amount >= 0.001)
        .sort((a: Cargo, b: Cargo) => b.amount - a.amount)
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.inventory {
  position: relative;
}
</style>
