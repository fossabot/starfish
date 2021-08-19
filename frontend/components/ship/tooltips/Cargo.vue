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

<script>
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
})
</script>

<style scoped lang="scss"></style>
