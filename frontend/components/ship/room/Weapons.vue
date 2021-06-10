<template>
  <Box class="weapons ">
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
          @mouseenter="
            $store.commit('tooltip', {
              type: 'weapon',
              data: i,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ i.displayName }}
          <div class="flex">
            <ProgressBar :mini="true" :percent="i.repair">
              <div>
                Repair:
                <NumberChangeHighlighter
                  :number="c.r2(i.repair * 100, 0)"
                  :display="c.r2(i.repair * 100, 0) + '%'"
                />
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

                <NumberChangeHighlighter
                  :number="
                    c.r2(
                      ((i.baseCooldown -
                        i.cooldownRemaining) /
                        i.baseCooldown) *
                        100,
                      0,
                    )
                  "
                  :display="
                    c.r2(
                      ((i.baseCooldown -
                        i.cooldownRemaining) /
                        i.baseCooldown) *
                        100,
                      0,
                    ) + '%'
                  "
                />
              </div>
            </ProgressBar>
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
            Any Target</button
          ><button
            v-for="ship in ship.enemiesInAttackRange"
            :key="'inattackrange' + ship.id"
            @click="
              $store.commit('setAttackTarget', ship.id)
            "
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
      <div class="panesection">
        toggle always attack factions:
        green/gray/red/blue/etc
      </div>
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
    itemTargets(this: ComponentShape) {
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
