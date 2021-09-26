<template>
  <Box
    class="weapons"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/8.jpg"
  >
    <template #title
      ><span class="sectionemoji">🎯</span>Weapons
      Bay</template
    >
    <div class="panesection" v-if="!weapons.length">
      No weapons on the ship!
    </div>
    <div v-else>
      <div class="panesection">
        <div class="panesubhead">Weapons</div>
        <div
          v-for="i in weapons"
          v-tooltip="{
            type: 'weapon',
            data: {
              type: 'weapon',
              id: i.id,
              ownerId: ship.id,
            },
          }"
        >
          {{ i.displayName }}
          <div class="">
            <PillBar
              :mini="true"
              :value="i.repair * i.maxHp"
              :max="i.maxHp"
            />
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
      </div>
      <div class="panesection">
        <div class="panesubhead">
          Majority Combat Strategy
        </div>
        <div>
          <div>
            <b>{{ c.capitalize(ship.mainTactic) }}</b>
          </div>
          <div>
            <span v-if="ship.targetShip">
              Targeting
              <b>🚀{{ ship.targetShip.name }}</b></span
            ><span v-else>No specific target ship</span>
          </div>
          <div>
            <span v-if="ship.itemTarget">
              Focusing fire on
              <b>{{ ship.itemTarget }}s</b></span
            ><span v-else>
              No specific target equipment
            </span>
          </div>
        </div>
      </div>
      <div class="panesection">
        <div class="panesubhead">Your Tactic</div>
        <div>
          <button
            v-for="tactic in c.tactics"
            @click="$store.commit('setTactic', tactic)"
            :class="{
              secondary: crewMember.tactic !== tactic,
            }"
          >
            {{ c.capitalize(tactic) }}
          </button>
        </div>
      </div>
      <div class="panesection">
        <div class="panesubhead">Your Target</div>
        <div>
          <button
            :class="{
              secondary: crewMember.attackTargetId,
            }"
            @click="$store.commit('setAttackTarget', null)"
          >
            Any Target</button
          ><button
            v-for="ship in ship.enemiesInAttackRange"
            :key="'inattackrange' + ship.id"
            @click="
              $store.commit('setAttackTarget', ship.id)
            "
            :class="{
              secondary:
                !crewMember.attackTargetId ||
                crewMember.attackTargetId !== ship.id,
            }"
          >
            🚀{{ ship.name }}
          </button>
        </div>
      </div>

      <div class="panesection">
        <div class="panesubhead">
          Your Target Equipment Type
        </div>
        <div>
          <button
            :class="{
              secondary: crewMember.itemTarget,
            }"
            @click="$store.commit('setItemTarget', null)"
          >
            Any Equipment</button
          ><button
            v-for="i in itemTargets"
            :key="'itemtarget' + i"
            @click="$store.commit('setItemTarget', i)"
            :class="{
              secondary:
                !crewMember.itemTarget ||
                crewMember.itemTarget !== i,
            }"
          >
            {{ c.capitalize(i) }}s
          </button>
        </div>
      </div>
      <!-- <div class="panesection">
        toggle always attack factions:
        green/gray/red/blue/etc
      </div> -->
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'room'
      )
    },
    weapons() {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'weapon',
      )
    },
    itemTargets() {
      const its: ItemType[] = [
        'weapon',
        'engine',
        'scanner',
        'communicator',
        'armor',
      ]
      return its
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.weapons {
  position: relative;
  width: 320px;
}
.active {
  background: var(--active, cyan);
}
</style>
