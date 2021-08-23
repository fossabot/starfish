<template>
  <div v-if="data">
    <div>
      <b>{{
        data.cargoData ? data.cargoData.name : data.name
      }}</b>
    </div>
    <hr />
    <div v-if="data.cargoData">
      Base price: 💳{{
        data.cargoData
          ? data.cargoData.basePrice
          : data.basePrice
      }}
    </div>
    <hr v-if="heldAmount" />
    <div v-if="heldAmount">
      You have {{ heldAmount }} ton{{
        heldAmount === 1 ? '' : 's'
      }}.
    </div>
    <div
      v-if="data.cargo"
      v-for="(cargo, index) in data.cargo"
      :key="'tooltipcargo' + index"
    >
      // todo
      {{ cargo }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['crewMember']),
    heldAmount(): number {
      const held = this.crewMember?.inventory?.find(
        (c: any) => c.id === (this.data as any).id,
      )
      if (held) return held.amount
      return 0
    },
  },
})
</script>

<style scoped lang="scss"></style>
