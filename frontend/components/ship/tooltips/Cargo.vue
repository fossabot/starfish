<template>
  <div>
    <div>
      <b>{{
        data.cargoData ? data.cargoData.name : data.name
      }}</b>
    </div>
    <hr />
    <div>
      Base price: 💳{{
        data.cargoData
          ? data.cargoData.basePrice
          : data.basePrice
      }}
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
