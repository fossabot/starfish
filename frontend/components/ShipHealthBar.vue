<template>
  <div class="shiphealthbar">
    <!-- <div class="armoroverlay" v-if="armor.length"></div> -->
    <HealthBar
      class="mainhealthbar"
      :max="ship._maxHp"
      :percent="ship._hp / ship._maxHp"
    >
      <div
        class="healthelement weapon"
        v-for="e in weapons"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * e.repair) / ship._maxHp) * 100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          itemId: e.id,
          id: e.id,
        }"
        v-targetpoint="{
          color: '#ff5a5c',
          type: 'item',
          itemType: 'weapon',
          location: ship.location,
          radius: e.range * e.repair,
        }"
      ></div>
      <div
        class="healthelement engine"
        v-for="e in engines"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * e.repair) / ship._maxHp) * 100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>
      <div
        class="healthelement scanner"
        v-for="e in scanners"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * e.repair) / ship._maxHp) * 100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>
      <div
        class="healthelement communicator"
        v-for="e in communicators"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * e.repair) / ship._maxHp) * 100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>
      <div
        class="healthelement armor"
        v-for="e in armor"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * e.repair) / ship._maxHp) * 100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>

      <div
        class="healthelement weapon losthealth"
        v-for="e in weapons"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * (1 - e.repair)) / ship._maxHp) *
              100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
        v-targetpoint="{
          color: '#ff5a5c',
          type: 'item',
          itemType: 'weapon',
          location: ship.location,
          radius: e.range * e.repair,
        }"
      ></div>
      <div
        class="healthelement engine losthealth"
        v-for="e in engines"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * (1 - e.repair)) / ship._maxHp) *
              100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>
      <div
        class="healthelement scanner losthealth"
        v-for="e in scanners"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * (1 - e.repair)) / ship._maxHp) *
              100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>
      <div
        class="healthelement communicator losthealth"
        v-for="e in communicators"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * (1 - e.repair)) / ship._maxHp) *
              100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>
      <div
        class="healthelement armor losthealth"
        v-for="e in armor"
        :class="{ fade: hoverId && hoverId !== e.id }"
        @mouseover="hoverId = e.id"
        @mouseout="hoverId = false"
        :style="{
          width:
            ((e.maxHp * (1 - e.repair)) / ship._maxHp) *
              100 +
            '%',
        }"
        v-tooltip="{
          type: 'healthbarsegment',
          ship: ship,
          itemType: e.itemType,
          id: e.id,
        }"
      ></div>
    </HealthBar>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

export default Vue.extend({
  props: {
    ship: {
      type: Object as PropType<ShipStub>,
      required: true,
    },
  },
  data() {
    return { hoverId: false }
  },
  computed: {
    ...mapState([]),
    maxHpWithoutArmor(): number {
      return Math.max(
        0,
        (this.ship._maxHp || 0) -
          this.armor.reduce(
            (total, a) =>
              (
                c.items[a.itemType][
                  a.itemId
                ] as BaseItemData
              ).maxHp + total,
            0,
          ),
      )
    },
    engines(): EngineStub[] {
      return (
        this.ship.items?.filter(
          (i: ItemStub) => i.itemType === 'engine',
        ) || []
      )
    },
    weapons(): WeaponStub[] {
      return (
        this.ship.items?.filter(
          (i: ItemStub) => i.itemType === 'weapon',
        ) || []
      )
    },
    scanners(): ItemStub[] {
      return (
        this.ship.items?.filter(
          (i: ItemStub) => i.itemType === 'scanner',
        ) || []
      )
    },
    communicators(): ItemStub[] {
      return (
        this.ship.items?.filter(
          (i: ItemStub) => i.itemType === 'communicator',
        ) || []
      )
    },
    armor(): ItemStub[] {
      return (
        this.ship.items?.filter(
          (i: ItemStub) => i.itemType === 'armor',
        ) || []
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.shiphealthbar {
  position: relative;
  height: 1em;
  background: rgba(75, 75, 75, 0.5);

  --radius: 0px;

  border-radius: var(--radius) !important;

  .armoroverlay {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: 0 0 0 3px var(--armor);
    border-radius: var(--radius);
  }

  .mainhealthbar {
    height: 100%;
    border-radius: var(--radius);
    display: flex;
    align-items: flex-end;
    border-radius: var(--radius) !important;
  }

  .healthelement {
    height: 100%;

    box-shadow: inset -1px 0 0 0 rgba(0, 0, 0, 0.3);

    &.losthealth {
      opacity: 0.2;
      height: 50%;
    }

    &.engine {
      background: var(--engine);
    }
    &.weapon {
      background: var(--weapon);
    }
    &.scanner {
      background: var(--scanner);
    }
    &.communicator {
      background: var(--communicator);
    }
    &.armor {
      background: var(--armor);
    }
  }
}
</style>
