<template>
  <div class="planetview">
    <ShipTooltipsHeader
      :name="dataToUse.name"
      :bg="`/images/paneBackgrounds/${
        dataToUse.planetType === 'basic' ? 5 : 19
      }.webp`"
      :tagline="c.getPlanetTitle(dataToUse)"
      :color="dataToUse.color"
      :guilds="alliedGuildIds"
      icon="🪐"
    />

    <div>
      <div
        v-if="dataToUse.pacifist"
        class="success marbottiny"
      >
        Safe haven
      </div>

      <div v-if="dataToUse.guildId" class="marbottiny">
        <span
          :style="{
            color: c.guilds[dataToUse.guildId].color,
          }"
        >
          {{ c.guilds[dataToUse.guildId].name }}
        </span>
        Homeworld
        <hr />
      </div>

      <div v-if="dataToUse.planetType === 'mining'">
        <div
          v-if="dataToUse.mine && dataToUse.mine.length"
          class="marbottiny"
        >
          <div class="bold">
            {{
              c.printList(
                dataToUse.mine.map(
                  (cargo) => c.cargo[cargo.id].name,
                ),
              )
            }}
          </div>
          mining colony
        </div>
      </div>

      <template v-if="dataToUse.planetType === 'basic'">
        <div
          v-if="dataToUse.repairFactor"
          class="success flexbetween marbottiny"
        >
          <div class="fade">Repair Field</div>
          <div class="success">Active</div>
        </div>

        <div
          v-if="dataToUse.defense"
          class="flexbetween marbottiny"
        >
          <div class="marrightsmall fade">
            Orbital Defense
          </div>
          <div class="textright">
            Lv.{{ c.r2(dataToUse.defense) }}
          </div>
        </div>

        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.cargo &&
            dataToUse.vendor.cargo.length
          "
          class="flexbetween marbottiny"
        >
          <div class="marrightsmall fade">Cargo</div>
          <div class="textright">
            {{
              c.printList(
                dataToUse.vendor.cargo.map(
                  (cargo) => c.cargo[cargo.id].name,
                ),
              )
            }}
          </div>
        </div>

        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.items &&
            dataToUse.vendor.items.length
          "
          class="flexbetween marbottiny"
        >
          <div class="fade">Equipment</div>
          <div>
            {{
              dataToUse.vendor.items.filter(
                (i) => i.buyMultiplier,
              ).length
            }}
            for sale
          </div>
        </div>

        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.chassis &&
            dataToUse.vendor.chassis.length
          "
          class="flexbetween marbottiny"
        >
          <div class="fade">Chassis</div>
          <div>
            {{ dataToUse.vendor.chassis.length }}
            for sale
          </div>
        </div>

        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.passives &&
            dataToUse.vendor.passives.length
          "
          class="flexbetween marbottiny"
        >
          <div class="fade">Crew Passives</div>
          <div>
            {{ dataToUse.vendor.passives.length }}
            for sale
          </div>
        </div>

        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.shipCosmetics &&
            dataToUse.vendor.shipCosmetics.length
          "
          class="flexbetween marbottiny"
        >
          <div class="fade">Ship Cosmetics</div>
          <div>
            {{ dataToUse.vendor.shipCosmetics.length }}
            for sale
          </div>
        </div>

        <div
          v-if="
            dataToUse.bank ||
            (ship &&
              ship.banked.find(
                (b) => b.id === dataToUse.id,
              ))
          "
          class="flexbetween marbottiny"
        >
          <div class="fade">Bank</div>
          <div>
            💳{{
              ship &&
              ship.banked.find((b) => b.id === dataToUse.id)
                ? ship.banked.find(
                    (b) => b.id === dataToUse.id,
                  ).amount
                : 0
            }}
            stored
          </div>
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
  width: 200px;
  position: relative;
  margin: calc(-1 * var(--tooltip-pad-tb))
    calc(-1 * var(--tooltip-pad-lr));

  & > *:not(.header) {
    padding: var(--tooltip-pad-tb) var(--tooltip-pad-lr);
  }
}
</style>
