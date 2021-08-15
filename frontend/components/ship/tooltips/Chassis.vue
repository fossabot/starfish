<template>
  <div v-if="data">
    <div>
      <b>{{ data.displayName }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>
    <hr v-if="Object.keys(data).length > 3" />
    <div v-if="data.slots">
      Equipment Slots: {{ data.slots }}
    </div>
    <div v-if="data.agility">
      Passive Dodge Modifier:
      {{ c.r2((data.agility - 1) * 100) + '%' }}
    </div>
    <div v-if="data.maxCargoSpace">
      Max Cargo Space Per Crew Member:
      {{ data.maxCargoSpace }}
    </div>
    <div v-if="data.mass">
      Mass: {{ c.numberWithCommas(data.mass) }}kg
    </div>

    <hr v-if="data.passives && data.passives.length" />
    <div v-for="passive in data.passives" class="success">
      {{
        c.basePassiveData[passive.id].toString(
          passive.intensity,
          passive,
        )
      }}
    </div>

    <hr v-if="data.description" />
    <div class="sub">{{ data.description }}</div>
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
