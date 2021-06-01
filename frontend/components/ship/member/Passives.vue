<template>
  <div class="panesection" v-if="sortedPassives.length">
    <div class="panesubhead">Passives</div>
    <div
      v-for="passive in sortedPassives"
      :key="'passive' + passive.type"
    >
      Lv.{{ passive.level }}
      {{ c.capitalize(passive.displayName) }}
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
    sortedPassives(this: ComponentShape) {
      return [...this.crewMember.passives].sort(
        (a: BaseCrewPassiveData, b: BaseCrewPassiveData) =>
          (b.level || 0) - (a.level || 0),
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
