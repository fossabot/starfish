<template>
  <Box class="weapons ">
    <template #title
      ><span class="sectionemoji">🎯</span>Weapons
      Bay</template
    >
    <div class="panesection" v-if="!weapons">
      No weapons on the ship!
    </div>
    <div class="panesection" v-if="weapons">
      <div class="panesubhead">Weapons</div>
      <div v-for="i in weapons">
        {{ i.displayName }}
        <div class="flex">
          <ProgressBar :mini="true" :percent="i.repair">
            <div>
              Repair:
              {{ Math.round(i.repair * 1000) / 10 }}%
            </div>
          </ProgressBar>
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
                  ((i.baseCooldown - i.cooldownRemaining) /
                    i.baseCooldown) *
                    100,
                )
              }}%
            </div>
          </ProgressBar>
        </div>
      </div>
    </div>
    <div class="panesection">
      <div class="panesubhead">Majority Tactic</div>
      <div>
        <b>{{ c.capitalize(ship.mainTactic) }}</b
        >,
        <span v-if="ship.targetShip">
          targeting <b>{{ ship.targetShip.name }}</b>
        </span>
        <span v-else>
          no specific target
        </span>
      </div>
    </div>
    <div class="panesection">
      <div class="panesubhead">
        Your Tactic
      </div>
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
      <div class="panesubhead">
        Your Target
      </div>
      <div>
        <button
          :class="{
            secondary: crewMember.attackTarget,
          }"
          @click="$store.commit('setAttackTarget', null)"
        >
          Any Target
        </button>
        <button
          v-for="ship in ship.enemiesInAttackRange"
          :key="'inattackrange' + ship.id"
          @click="$store.commit('setAttackTarget', ship.id)"
          :class="{
            secondary:
              !crewMember.attackTarget ||
              crewMember.attackTarget.id !== ship.id,
          }"
        >
          🚀{{ ship.name }}
        </button>
      </div>
    </div>
    <div class="panesection">
      toggle always attack factions: green/gray/red/blue/etc
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    weapons(this: ComponentShape) {
      return this.ship.items.filter(
        (i: ItemStub) => i.type === 'weapon',
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
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
