<template>
  <div>
    <h3 style="font-size: 1.3em">
      Ship HP:
      {{
        c.numberWithCommas(
          c.r2(data.ship._hp * c.displayHPMultiplier, 0),
        )
      }}
      <span class="sub"
        >/
        {{
          c.numberWithCommas(
            c.r2(
              data.ship._maxHp * c.displayHPMultiplier,
              0,
            ),
          )
        }}</span
      >
    </h3>

    <template v-if="item">
      <hr />
      <ShipTooltipsItem :data="item" />
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    data: {
      type: Object as PropType<{
        ship: ShipStub
        itemType: ItemType
        id: string
      }>,
    },
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
    item() {
      return (
        this.data.ship.items?.find(
          (i) => i.id === (this.data as any).id,
        ) ||
        this.data.ship.items?.find(
          (i) =>
            i.itemType === (this.data as any).itemType &&
            i.itemId === (this.data as any).id,
        )
      )
    },
  },
})
</script>

<style scoped lang="scss"></style>
