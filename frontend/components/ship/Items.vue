<template>
  <div class="items" v-if="show" :highlight="highlight">
    <Box bgImage="/images/paneBackgrounds/3.jpg">
      <template #title>
        <span class="sectionemoji">🛠</span>Ship Equipment
      </template>

      <div class="panesection itemlist">
        <div
          v-for="i in armor"
          v-tooltip="{
            type: 'armor',
            data: i,
          }"
        >
          {{ i.displayName }}
          <span class="sub">{{
            c.capitalize(i.type)
          }}</span>
          <div>
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
          </div>
        </div>
        <div
          v-for="i in weapons"
          v-tooltip="{
            type: 'weapon',
            data: i,
          }"
        >
          {{ i.displayName }}
          <span class="sub">{{
            c.capitalize(i.type)
          }}</span>
          <div>
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
          </div>
          <div class="">
            <ProgressBar
              :micro="true"
              :percent="
                (i.baseCooldown - i.cooldownRemaining) /
                i.baseCooldown
              "
              :dangerZone="-1"
            />
          </div>
        </div>
        <div
          v-for="i in engines"
          v-tooltip="{
            type: 'engine',
            data: i,
          }"
        >
          {{ i.displayName }}
          <span class="sub">{{
            c.capitalize(i.type)
          }}</span>
          <div>
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
          </div>
        </div>
        <div
          v-for="i in scanners"
          v-tooltip="{
            type: 'scanner',
            data: i,
          }"
        >
          {{ i.displayName }}
          <span class="sub">{{
            c.capitalize(i.type)
          }}</span>
          <div>
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
          </div>
        </div>
        <div
          v-for="i in communicators"
          v-tooltip="{
            type: 'communicator',
            data: i,
          }"
        >
          {{ i.displayName }}
          <span class="sub">{{
            c.capitalize(i.type)
          }}</span>
          <div>
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
          </div>
        </div>
        <div
          v-for="i in other"
          v-tooltip="{
            type: i.type,
            data: i,
          }"
        >
          {{ i.displayName }}
          <span class="sub">{{
            c.capitalize(i.type)
          }}</span>
          <div>
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
          </div>
        </div>
      </div>

      <div class="panesection sub">
        Equipment Slots Used: {{ ship.items.length }}/{{
          ship.slots
        }}
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
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
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'engine',
      )
    },
    weapons() {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'weapon',
      )
    },
    scanners() {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'scanner',
      )
    },
    communicators() {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'communicator',
      )
    },
    armor() {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'armor',
      )
    },
    other() {
      return this.ship.items.filter(
        (i: ItemStub) =>
          i.type !== 'engine' &&
          i.type !== 'weapon' &&
          i.type !== 'scanner' &&
          i.type !== 'communicator' &&
          i.type !== 'armor',
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
  width: 250px;
  position: relative;
  grid-column: span 2;
}
.itemlist {
  & > * {
    margin-bottom: 0.5em;
  }
}
</style>
