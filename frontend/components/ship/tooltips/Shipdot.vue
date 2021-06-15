<template>
  <div>
    <div>
      <b>🚀{{ data.name }}</b>
      <div v-if="data.tagline" class="sub">
        {{ data.tagline }}
      </div>
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
      {{ Math.round(data.level) }}
    </div>
    <div v-if="data.planet">
      At planet 🪐{{ data.planet.name }}
    </div>
    <div>
      <div
        v-for="(item, index) in data.items || []"
        :key="'tooltipscanitem' + index"
      >
        {{ c.capitalize(item.type) }}:
        {{ item.displayName }}
      </div>
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
