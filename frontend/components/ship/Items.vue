<template>
  <div class="items" v-if="show" :highlight="highlight">
    <Box bgImage="/images/paneBackgrounds/3.webp">
      <template #title>
        <span class="sectionemoji">🛠</span>Ship Equipment
      </template>

      <div class="panesection itemlist">
        <div
          v-for="i in armor"
          v-tooltip="{
            type: 'item',
            itemType: i.itemType,
            itemId: i.itemId,
            ownerId: ship.id,
          }"
        >
          {{ i.displayName }}
          <span
            v-if="i.level && i.maxLevel && i.maxLevel > 1"
            class="level"
            :class="{ max: i.level === i.maxLevel }"
            >{{ i.level }}</span
          >
          <span class="sub">{{
            c.capitalize(i.itemType)
          }}</span>
          <div class="hpbar">
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
            type: 'item',
            itemType: i.itemType,
            itemId: i.itemId,
            ownerId: ship.id,
          }"
          v-targetpoint="{
            color: '#ff7733',
            type: 'item',
            itemType: 'weapon',
            location: ship.location,
            radius: i.range * i.repair,
          }"
        >
          {{ i.displayName }}
          <span
            v-if="i.level && i.maxLevel && i.maxLevel > 1"
            class="level"
            :class="{ max: i.level === i.maxLevel }"
            >{{ i.level }}</span
          >
          <span class="sub">{{
            c.capitalize(i.itemType)
          }}</span>
          <div class="hpbar">
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
                (i.chargeRequired - i.cooldownRemaining) /
                i.chargeRequired
              "
              :dangerZone="-1"
            />
          </div>
        </div>
        <div
          v-for="i in engines"
          v-tooltip="{
            type: 'item',
            itemType: i.itemType,
            itemId: i.itemId,
            ownerId: ship.id,
          }"
        >
          {{ i.displayName }}
          <span
            v-if="i.level && i.maxLevel && i.maxLevel > 1"
            class="level"
            :class="{ max: i.level === i.maxLevel }"
            >{{ i.level }}</span
          >
          <span class="sub">{{
            c.capitalize(i.itemType)
          }}</span>
          <div class="hpbar">
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
            type: 'item',
            itemType: i.itemType,
            itemId: i.itemId,
            ownerId: ship.id,
          }"
        >
          {{ i.displayName }}
          <span
            v-if="i.level && i.maxLevel && i.maxLevel > 1"
            class="level"
            :class="{ max: i.level === i.maxLevel }"
            >{{ i.level }}</span
          >
          <span class="sub">{{
            c.capitalize(i.itemType)
          }}</span>
          <div class="hpbar">
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
            type: 'item',
            itemType: i.itemType,
            itemId: i.itemId,
            ownerId: ship.id,
          }"
        >
          {{ i.displayName }}
          <span
            v-if="i.level && i.maxLevel && i.maxLevel > 1"
            class="level"
            :class="{ max: i.level === i.maxLevel }"
            >{{ i.level }}</span
          >
          <span class="sub">{{
            c.capitalize(i.itemType)
          }}</span>
          <div class="hpbar">
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
            type: 'item',
            itemType: i.itemType,
            itemId: i.itemId,
            ownerId: ship.id,
          }"
        >
          {{ i.displayName }}
          <span
            v-if="i.level && i.maxLevel && i.maxLevel > 1"
            class="level"
            :class="{ max: i.level === i.maxLevel }"
            >{{ i.level }}</span
          >
          <span class="sub">{{
            c.capitalize(i.itemType)
          }}</span>
          <div class="hpbar">
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
          </div>
        </div>
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
        (i: ItemStub) => i.itemType === 'engine',
      )
    },
    weapons() {
      return this.ship.items.filter(
        (i: ItemStub) => i.itemType === 'weapon',
      )
    },
    scanners() {
      return this.ship.items.filter(
        (i: ItemStub) => i.itemType === 'scanner',
      )
    },
    communicators() {
      return this.ship.items.filter(
        (i: ItemStub) => i.itemType === 'communicator',
      )
    },
    armor() {
      return this.ship.items.filter(
        (i: ItemStub) => i.itemType === 'armor',
      )
    },
    other() {
      return this.ship.items.filter(
        (i: ItemStub) =>
          i.itemType !== 'engine' &&
          i.itemType !== 'weapon' &&
          i.itemType !== 'scanner' &&
          i.itemType !== 'communicator' &&
          i.itemType !== 'armor',
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

  & > * {
    margin-bottom: 0.6em;
  }
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
  padding: 0.2em 0.4em 0em 0.4em;
  border-radius: 1em;
  // margin: 0 0.4em;

  &.max {
    background: var(--success);
  }
}
</style>
