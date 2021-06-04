<template>
  <div>
    <div>
      <b>🚀{{ data.name }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>
    <div>{{ data.description }}</div>
    <hr />
    <div>Chassis: {{ data.chassis.displayName }}</div>
    <div v-if="data.species">
      Species:
      {{ data.species.icon
      }}{{ c.capitalize(data.species.id) }}
    </div>
    <div v-if="data.faction">
      Faction:
      <span :style="{ color: data.faction.color }">{{
        data.faction.name
      }}</span>
    </div>
    <div v-if="data.level">
      Level:
      {{ Math.ceil(data.level) }}
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
  mounted() {},
}
</script>

<style scoped lang="scss"></style>
