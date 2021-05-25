<template>
  <div class="items" v-if="ship">
    <Box>
      <template #title>
        <span class="sectionemoji">🛠</span>Ship Equipment
      </template>

      <div class="panesection" v-if="weapons">
        <div class="panesubhead">Weapons</div>
        <div v-for="i in weapons">
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                {{
                  Math.round(i.repair * i.maxHp * 100) /
                    100
                }}/{{ i.maxHp }} ({{
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
                {{
                  Math.floor(
                    ((i.baseCooldown -
                      i.cooldownRemaining) /
                      i.baseCooldown) *
                      100,
                  )
                }}%
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div class="panesection" v-if="engines">
        <div class="panesubhead">Engines</div>
        <div v-for="i in engines">
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                {{
                  Math.round(i.repair * i.maxHp * 100) /
                    100
                }}/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>

      <div class="panesection" v-if="other">
        <div class="panesubhead">Other Items</div>
        <div v-for="i in other">
          {{ i.displayName }}
          <div>
            <ProgressBar
              :mini="true"
              :percent="(i.repair * i.maxHp) / i.maxHp"
            >
              <div>
                🇨🇭HP:
                {{
                  Math.round(i.repair * i.maxHp * 100) /
                    100
                }}/{{ i.maxHp }} ({{
                  Math.round(
                    ((i.repair * i.maxHp) / i.maxHp) * 1000,
                  ) / 10
                }}%)
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
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
    other(this: ComponentShape) {
      return this.ship.items.filter(
        (i: ItemStub) =>
          i.type !== 'engine' && i.type !== 'weapon',
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
  width: 250px;
  position: relative;
  grid-column: span 2;
}
</style>
