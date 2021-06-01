<template>
  <div>
    <div>🪐{{ data.name }}</div>
    <div v-if="data.faction">
      Faction:
      <span :style="{ color: data.faction.color }">{{
        data.faction.name
      }}</span>
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
