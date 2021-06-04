<template>
  <div>
    <div>
      <b>🪐{{ data.name }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>
    <div>{{ data.description }}</div>
    <hr />
    <div v-if="data.faction">
      Faction:
      <span :style="{ color: data.faction.color }">{{
        data.faction.name
      }}</span>
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
}
</script>

<style scoped lang="scss"></style>
