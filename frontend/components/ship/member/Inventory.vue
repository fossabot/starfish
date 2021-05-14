<template>
  <div class="inventory box">
    <b>Inventory</b>
    <div>Credits: {{ crewMember.credits }}</div>
    <div v-if="!crewMember.inventory.length">
      Nothing in inventory
    </div>
    <div
      v-for="item in crewMember.inventory"
      :key="'inv' + item.type"
    >
      {{ item.type }}: {{ item.amount }}
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
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
