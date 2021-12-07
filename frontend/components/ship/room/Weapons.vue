<template>
  <Box
    class="weapons"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/8.webp"
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
        <ShipItem
          v-for="i in weapons"
          :key="i.id"
          :item="i"
          :owner="ship"
        />

        <div class="martop sub">
          Your charge speed:
          {{
            c.numberWithCommas(
              c.r2(chargePerSecond * 60, 0),
            )
          }}/min
        </div>
      </div>
      <div class="panesection">
        <div class="panesubhead">
          Majority Combat Strategy
        </div>
        <div>
          <div>
            <b>{{
              c.capitalize(
                c.camelCaseToWords(ship.combatTactic),
              )
            }}</b>
          </div>
          <div>
            <span v-if="targetShip">
              Targeting
              <b>{{ targetShip.name }}</b></span
            ><span v-else>No specific target ship</span>
          </div>
          <div>
            <span v-if="ship.targetItemType !== 'any'">
              Focusing fire on
              <b>{{ ship.targetItemType }}s</b></span
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
            @click="$store.commit('setTactic', 'none')"
            :class="{
              secondary: crewMember.combatTactic !== 'none',
            }"
            v-tooltip="
              `Defer to others' tactic choices. If no one else is in the weapons bay, defaults to Pacifist.`
            "
          >
            <span>No Preference</span></button
          ><button
            v-for="tactic in c.tactics"
            :key="'tactic' + tactic"
            @click="$store.commit('setTactic', tactic)"
            :class="{
              secondary: crewMember.combatTactic !== tactic,
            }"
            v-tooltip="
              tactic === 'aggressive'
                ? 'Attack any enemy in range, as soon as possible.'
                : tactic === 'defensive'
                ? 'Attack the ship in range that most recently attacked you, or wait until you are attacked to fire back.'
                : tactic === 'onlyPlayers'
                ? 'Attack any enemy player-controlled ship in range, as soon as possible.'
                : tactic === 'onlyNonPlayers'
                ? 'Attack any enemy game-controlled ship in range, as soon as possible.'
                : null
            "
          >
            <span>{{
              c.capitalize(c.camelCaseToWords(tactic))
            }}</span>
          </button>
        </div>
      </div>

      <div class="panesection">
        <div class="panesubhead">Your Target</div>
        <div>
          <button
            :class="{
              secondary:
                crewMember.attackTargetId !== 'any',
            }"
            @click="$store.commit('setAttackTarget', 'any')"
          >
            <span>Any Target</span></button
          ><button
            :class="{
              secondary:
                crewMember.attackTargetId !== 'closest',
            }"
            @click="
              $store.commit('setAttackTarget', 'closest')
            "
          >
            <span>Closest Target</span></button
          ><button
            v-for="targetShip in visibleEnemies"
            :key="'inattackrange' + targetShip.id"
            @click="
              $store.commit(
                'setAttackTarget',
                targetShip.id,
              )
            "
            :class="{
              secondary:
                !crewMember.attackTargetId ||
                crewMember.attackTargetId !== targetShip.id,
            }"
            v-targetpoint="targetShip"
          >
            <span>{{ targetShip.name }}</span>
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
              secondary:
                crewMember.targetItemType !== 'any',
            }"
            @click="
              $store.commit('setTargetItemType', 'any')
            "
          >
            <span>Any Equipment</span></button
          ><button
            v-for="i in targetItemTypes"
            :key="'targetitemtype' + i"
            @click="$store.commit('setTargetItemType', i)"
            :class="{
              secondary:
                !crewMember.targetItemType ||
                crewMember.targetItemType !== i,
            }"
          >
            <span
              >{{ c.capitalize(i)
              }}{{ i === 'armor' ? '' : 's' }}</span
            >
          </button>
        </div>
      </div>
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
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'room'
      )
    },
    weapons(): WeaponStub[] {
      return this.ship.items.filter(
        (i: ItemStub) => i.itemType === 'weapon',
      )
    },
    dexterityLevel(): number {
      const passiveBoost = this.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc +
          (p.id === 'boostDexterity'
            ? p.intensity || 0
            : 0),
        0,
      )
      return (
        (this.crewMember.skills.find(
          (s) => s.skill === 'dexterity',
        )?.level || 1) + passiveBoost
      )
    },
    chargePerSecond(): number {
      const passiveMultiplier =
        this.ship.passives.reduce(
          (total: number, p: ShipPassiveEffect) =>
            total +
            (p.id === `boostWeaponChargeSpeed`
              ? p.intensity || 0
              : 0),
          0,
        ) +
        this.crewMember.passives.reduce(
          (total: number, p: ShipPassiveEffect) =>
            total +
            (p.id === `boostWeaponChargeSpeed`
              ? p.intensity || 0
              : 0),
          0,
        ) +
        1
      return (
        ((c.getWeaponCooldownReductionPerTick(
          this.dexterityLevel,
        ) *
          c.tickInterval) /
          1000) *
        passiveMultiplier
      )
    },
    targetItemTypes(): ItemType[] {
      const its: ItemType[] = [
        'weapon',
        'engine',
        'scanner',
        'communicator',
        'armor',
      ]
      return its
    },
    targetShip(): ShipStub | undefined {
      return (
        this.ship.targetShip &&
        this.ship.visible?.ships.find(
          (s) => s.id === this.ship.targetShip.id,
        )
      )
    },
    visibleEnemies(): ShipStub[] {
      return this.ship.visible?.ships
        .filter(
          (s) =>
            !s.guildId || s.guildId !== this.ship.guildId,
        )
        .sort(
          (a, b) =>
            c.distance(a.location, this.ship.location) -
            c.distance(b.location, this.ship.location),
        )
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
