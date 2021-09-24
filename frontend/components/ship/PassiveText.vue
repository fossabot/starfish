<template>
  <span>
    <span class="success">
      {{ c.basePassiveData[passive.id].toString(passive) }}
    </span>
    <span
      class="sub nowrap"
      v-if="passive.data && passive.data.source"
    >
      ({{
        passive.data.source.speciesId
          ? `${c.capitalize(
              c.species[passive.data.source.speciesId]
                .singular,
            )} species`
          : passive.data.source.planetName
          ? `Planet ${passive.data.source.planetName}`
          : passive.data.source.item
          ? `${
              c.items[passive.data.source.item.type][
                passive.data.source.item.id
              ].displayName
            }`
          : passive.data.source.chassisId
          ? `${
              c.items.chassis[passive.data.source.chassisId]
                .displayName
            }`
          : passive.data.source
      }})
    </span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { passive: { required: true } },
  data() {
    return { c }
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped></style>
