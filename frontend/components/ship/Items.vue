<template>
  <div class="items" v-if="ship">
    <div class="box">
      <h4>Ship Equipment</h4>

      <div class="box" v-if="ship.weapons">
        <h5>Weapons</h5>
        <div v-for="i in ship.weapons">
          {{ i.displayName }}
          <div>
            <ProgressBar :percent="i.repair">
              <div>
                Repair:
                {{ Math.round(i.repair * 1000) / 10 }}%
              </div>
            </ProgressBar>
          </div>
          <div>
            <ProgressBar
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

      <div class="box" v-if="ship.engines">
        <h5>Engines</h5>
        <div v-for="i in ship.engines">
          {{ i.displayName }}
          <div>
            <ProgressBar :percent="i.repair">
              <div>
                Repair:
                {{ Math.round(i.repair * 1000) / 10 }}%
              </div>
            </ProgressBar>
          </div>
        </div>
      </div>
    </div>
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
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.items {
  width: 200px;
  position: relative;
  grid-column: span 2;
}

.box {
  width: 100%;
}
</style>
