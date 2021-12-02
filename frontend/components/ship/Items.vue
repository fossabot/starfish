<template>
  <div class="items" v-if="show" :highlight="highlight">
    <Box bgImage="/images/paneBackgrounds/3.webp">
      <template #title>
        <span class="sectionemoji">🛠</span>Ship Equipment
      </template>

      <div class="panesection itemlist">
        <ShipItem
          v-for="i in armor"
          :key="i.id"
          :item="i"
          :owner="ship"
        />
        <ShipItem
          v-for="i in weapons"
          :key="i.id"
          :item="i"
          :owner="ship"
        />
        <ShipItem
          v-for="i in engines"
          :key="i.id"
          :item="i"
          :owner="ship"
        />
        <ShipItem
          v-for="i in scanners"
          :key="i.id"
          :item="i"
          :owner="ship"
        />
        <ShipItem
          v-for="i in communicators"
          :key="i.id"
          :item="i"
          :owner="ship"
        />
        <ShipItem
          v-for="i in other"
          :key="i.id"
          :item="i"
          :owner="ship"
        />
      </div>

      <div class="panesection sub flexcenter">
        <div class="nowrap">
          Equipment Slots Used: {{ ship.items.length }}/{{
            ship.slots
          }}
        </div>
        <PillBar
          :micro="true"
          :value="ship.items.length"
          :max="ship.slots"
          class="slots"
        />
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState([
      'userId',
      'ship',
      'crewMember',
      'tooltip',
    ]),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('items'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'items'
      )
    },
    engines() {
      return (
        this.ship.items.filter(
          (i: ItemStub) => i.itemType === 'engine',
        ) || []
      )
    },
    weapons() {
      return (
        this.ship.items.filter(
          (i: ItemStub) => i.itemType === 'weapon',
        ) || []
      )
    },
    scanners() {
      return (
        this.ship.items.filter(
          (i: ItemStub) => i.itemType === 'scanner',
        ) || []
      )
    },
    communicators() {
      return (
        this.ship.items.filter(
          (i: ItemStub) => i.itemType === 'communicator',
        ) || []
      )
    },
    armor() {
      return (
        this.ship.items.filter(
          (i: ItemStub) => i.itemType === 'armor',
        ) || []
      )
    },
    other() {
      return (
        this.ship.items.filter(
          (i: ItemStub) =>
            i.itemType !== 'engine' &&
            i.itemType !== 'weapon' &&
            i.itemType !== 'scanner' &&
            i.itemType !== 'communicator' &&
            i.itemType !== 'armor',
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
.items {
  width: 300px;
  position: relative;
  grid-column: span 2;
}
.itemlist {
  line-height: 1.1;
}
.hpbar {
  margin-top: 0.2em;
}

.slots {
  margin-left: 0.5em;
}

.level {
  position: relative;
  display: inline-block;
  height: 1.3em;
  top: -0.3em;
  background: var(--gray);
  // color: var(--bg);
  font-weight: bold;
  text-shadow: 0 0 0.2em var(--bg);
  font-size: 0.6em;
  line-height: 1;
  padding: 0.3em 0.4em 0em 0.4em;
  border-radius: 1em;
  // margin: 0 0.4em;

  &.max {
    background: var(--success);
  }
}
</style>
