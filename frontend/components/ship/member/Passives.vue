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
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['crewMember']),
    sortedPassives() {
      return [...this.crewMember.passives].sort(
        (a: CrewPassiveData, b: CrewPassiveData) =>
          (b.level || 0) - (a.level || 0),
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped></style>
