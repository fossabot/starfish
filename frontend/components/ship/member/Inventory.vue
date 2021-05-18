<template>
  <div class="inventory panesection">
    <div class="panesubhead">Inventory</div>
    <div>Credits: {{ crewMember.credits }}</div>
    <div v-if="!crewMember.inventory.length">
      Nothing in inventory
    </div>
    <div
      v-for="item in crewMember.inventory"
      :key="'inv' + item.type"
    >
      {{ c.capitalize(item.type) }}: {{ item.amount }}
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
