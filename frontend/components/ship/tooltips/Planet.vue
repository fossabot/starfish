<template>
  <div class="planetview">
    <div class="header">
      <div
        class="bg"
        :style="{
          'background-image': `url('/images/paneBackgrounds/${
            dataToUse.planetType === 'basic'
              ? 5
              : dataToUse.planetType === 'comet'
              ? 21
              : 19
          }.jpg')`,
        }"
      ></div>
      <div
        class="bgtint2"
        :style="{ 'background-color': dataToUse.color }"
      />
      <div
        class="bgtint"
        :style="{ 'background-color': dataToUse.color }"
      />
      <div class="bgfade"></div>

      <div class="guildtags">
        <img
          v-for="id in alliedGuildIds"
          :src="`/images/guildBadges/badge-${id}.png`"
        />
      </div>

      <div class="title">
        <div>🪐</div>
        <div>
          <span
            :style="{ color: dataToUse.color }"
            class="bold"
            >{{ dataToUse.name }}</span
          >
          <div class="sub normal">
            <span class="sub">{{
              c.getPlanetTitle(data)
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div v-if="dataToUse.guildId">
        <span
          :style="{
            color: c.guilds[dataToUse.guildId].color,
          }"
          >{{ c.guilds[dataToUse.guildId].name }}</span
        >
        Homeworld
        <hr />
      </div>

      <div v-if="dataToUse.planetType === 'mining'">
        <div v-if="dataToUse.mine && dataToUse.mine.length">
          {{
            c.printList(
              dataToUse.mine.map(
                (cargo) => c.cargo[cargo.id].name,
              ),
            )
          }}
          mining colony
        </div>
      </div>

      <div v-if="dataToUse.pacifist" class="success">
        Safe haven
      </div>

      <template v-if="dataToUse.planetType === 'basic'">
        <div v-if="dataToUse.repairFactor" class="success">
          Repair field active
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.cargo &&
            dataToUse.vendor.cargo.length
          "
        >
          {{
            c.printList(
              dataToUse.vendor.cargo.map(
                (cargo) => c.cargo[cargo.id].name,
              ),
            )
          }}
          for sale
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.items &&
            dataToUse.vendor.items.length
          "
        >
          Equipment:
          {{
            dataToUse.vendor.items.filter(
              (i) => i.buyMultiplier,
            ).length
          }}
          for sale
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.chassis &&
            dataToUse.vendor.chassis.length
          "
        >
          Chassis:
          {{ dataToUse.vendor.chassis.length }}
          for sale
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.passives &&
            dataToUse.vendor.passives.length
          "
        >
          Crew passives:
          {{ dataToUse.vendor.passives.length }}
          for sale
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.shipCosmetics &&
            dataToUse.vendor.shipCosmetics.length
          "
        >
          Ship cosmetics:
          {{ dataToUse.vendor.shipCosmetics.length }}
          for sale
        </div>

        <div v-if="dataToUse.bank">
          Bank: 💳{{
            ship &&
            ship.banked.find((b) => b.id === dataToUse.id)
              ? ship.banked.find(
                  (b) => b.id === dataToUse.id,
                ).amount
              : 0
          }}
          stored
        </div>

        <hr />

        <ShipPlanetGuildGraph :planet="dataToUse" />
      </template>

      <!-- <hr v-if="c.getPlanetDescription(data)" />
    <div v-if="c.getPlanetDescription(data)" class="sub">
      {{ c.getPlanetDescription(data) }}
    </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    dataToUse(): PlanetStub {
      return (
        this.ship?.seenPlanets?.find(
          (p) => p.id === (this.data as any).id,
        ) || this.data
      )
    },
    alliedGuildIds(): string[] {
      const ids: Set<string> = new Set()
      if (this.dataToUse.guildId) {
        ids.add(this.dataToUse.guildId)
      }
      if (this.dataToUse.allegiances) {
        this.dataToUse.allegiances.forEach((a) => {
          if (a.level >= c.guildAllegianceFriendCutoff)
            ids.add(a.guildId)
        })
      }

      return Array.from(ids)
    },
  },
})
</script>

<style scoped lang="scss">
.planetview {
  min-width: 200px;
  position: relative;
  margin: calc(-1 * var(--tooltip-pad-tb))
    calc(-1 * var(--tooltip-pad-lr));

  & > *:not(.header) {
    padding: var(--tooltip-pad-tb) var(--tooltip-pad-lr);
  }
}
.header {
  position: relative;
  height: 100px;
  width: 100%;

  & > * {
    position: relative;
    z-index: 3;
  }

  .bg,
  .bgtint,
  .bgfade,
  .bgtint2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-size: cover;
    background-position: center;
  }

  .bgtint {
    z-index: 3;
    mix-blend-mode: hue;
    opacity: 0.7;
  }
  .bgtint2 {
    z-index: 3;
    mix-blend-mode: saturation;
    opacity: 1;
  }

  .bgfade {
    z-index: 2;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--bg) 75%
    );
    mix-blend-mode: multiply;
    opacity: 0.8;
  }

  .guildtags {
    position: absolute;
    z-index: 4;
    top: 0;
    right: 0.2em;
    display: flex;
    flex-direction: row-reverse;

    img {
      width: 35px;
      display: block;
      position: relative;
      margin-left: -0.35em;
    }
  }

  .title {
    z-index: 4;
    position: absolute;
    bottom: 0;
    padding: var(--tooltip-pad-tb) var(--tooltip-pad-lr);
    font-size: 1.3em;
    line-height: 1.2;
    display: grid;
    grid-template-columns: 1.2em 1fr;
  }
}
</style>
