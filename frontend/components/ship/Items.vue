<template>
  <div class="items" v-if="show" :highlight="highlight">
    <Box>
      <template #title>
        <span class="sectionemoji">🛠</span>Ship Equipment
      </template>

      <div class="panesection" v-if="armor && armor.length">
        <div class="panesubhead">Armor</div>
        <div
          v-for="i in armor"
          @mouseenter="
            $store.commit('tooltip', {
              type: 'armor',
              data: i,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                <NumberChangeHighlighter
                  :number="c.r2(i.repair * i.maxHp)"
                />/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div class="panesection" v-if="weapons.length">
        <div class="panesubhead">Weapons</div>
        <div
          v-for="i in weapons"
          @mouseenter="
            $store.commit('tooltip', {
              type: 'weapon',
              data: i,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                <NumberChangeHighlighter
                  :number="c.r2(i.repair * i.maxHp)"
                />/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
          <div>
            <ProgressBar
              :mini="true"
              :percent="
                (i.baseCooldown - i.cooldownRemaining) /
                  i.baseCooldown
              "
              :dangerZone="-1"
            >
              <div>
                Charge:
                <NumberChangeHighlighter
                  :number="
                    Math.floor(
                      ((i.baseCooldown -
                        i.cooldownRemaining) /
                        i.baseCooldown) *
                        100,
                    )
                  "
                  :display="
                    Math.floor(
                      ((i.baseCooldown -
                        i.cooldownRemaining) /
                        i.baseCooldown) *
                        100,
                    ) + '%'
                  "
                />
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div class="panesection" v-if="engines.length">
        <div class="panesubhead">Engines</div>
        <div
          v-for="i in engines"
          @mouseenter="
            $store.commit('tooltip', {
              type: 'engine',
              data: i,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                <NumberChangeHighlighter
                  :number="c.r2(i.repair * i.maxHp)"
                />/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div class="panesection" v-if="scanners.length">
        <div class="panesubhead">Scanners</div>
        <div
          v-for="i in scanners"
          @mouseenter="
            $store.commit('tooltip', {
              type: 'scanner',
              data: i,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                <NumberChangeHighlighter
                  :number="c.r2(i.repair * i.maxHp)"
                />/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div
        class="panesection"
        v-if="communicators && communicators.length"
      >
        <div class="panesubhead">Communicators</div>
        <div
          v-for="i in communicators"
          @mouseenter="
            $store.commit('tooltip', {
              type: 'communicator',
              data: i,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                <NumberChangeHighlighter
                  :number="c.r2(i.repair * i.maxHp)"
                />/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div class="panesection" v-if="other.length">
        <div class="panesubhead">Other Items</div>
        <div
          v-for="i in other"
          @mouseenter="
            $store.commit('tooltip', {
              type: i.type,
              data: i,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                <NumberChangeHighlighter
                  :number="c.r2(i.repair * i.maxHp)"
                />/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div class="panesection sub">
        Equipment Slots Used: {{ ship.items.length }}/{{
          ship.chassis.slots
        }}
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('items'))
      )
    },
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'items'
      )
    },
    engines(this: ComponentShape) {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'engine',
      )
    },
    weapons(this: ComponentShape) {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'weapon',
      )
    },
    scanners(this: ComponentShape) {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'scanner',
      )
    },
    communicators(this: ComponentShape) {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'communicator',
      )
    },
    armor(this: ComponentShape) {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'armor',
      )
    },
    other(this: ComponentShape) {
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
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.items {
  width: 260px;
  position: relative;
  grid-column: span 2;
}
</style>
