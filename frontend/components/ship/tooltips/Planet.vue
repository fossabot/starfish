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
      <div v-if="dataToUse.pacifist" class="success marbottiny">Safe haven</div>

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
        <div v-if="dataToUse.mine && dataToUse.mine.length" class="marbottiny">
          <div class="bold">
            {{
              c.printList(dataToUse.mine.map((cargo) => c.cargo[cargo.id].name))
            }}
          </div>
          mining colony
        </div>
      </div>

      <div v-if="dataToUse.defense" class="flexbetween marbottiny">
        <div class="marrightsmall fade">Orbital Defense</div>
        <div class="textright">Lv.{{ c.r2(dataToUse.defense) }}</div>
      </div>

      <template v-if="dataToUse.planetType === 'basic'">
        <div
          v-if="
            dataToUse.passives &&
            dataToUse.passives.find((p) => p.id === 'autoRepair')
          "
          class="success flexbetween marbottiny"
        >
          <div class="fade">Repair Field</div>
          <div class="success">Active</div>
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
            <div v-if="showCargoPrices">
              <div
                v-for="cargo in dataToUse.vendor.cargo"
                :key="cargo.id + 'tooltipbuy'"
              >
                {{ c.cargo[cargo.id].name }}
                <span class="small">
                  <span class="sub"
                    >(B:
                    <span
                      :class="{
                        success:
                          (c.getCargoBuyPrice(
                            cargo.id,
                            dataToUse,
                            ship.guildId,
                            1,
                            charismaLevel,
                          ).credits || 0) <
                          (c.cargo[cargo.id].basePrice.credits || 0),
                        warning:
                          (c.getCargoBuyPrice(
                            cargo.id,
                            dataToUse,
                            ship.guildId,
                            1,
                            charismaLevel,
                          ).credits || 0) >
                          (c.cargo[cargo.id].basePrice.credits || 0),
                      }"
                      >{{
                        c.getCargoBuyPrice(
                          cargo.id,
                          dataToUse,
                          ship.guildId,
                          1,
                          charismaLevel,
                        ).credits
                      }}</span
                    >, S:
                    <span
                      :class="{
                        success:
                          (c.getCargoSellPrice(
                            cargo.id,
                            dataToUse,
                            ship.guildId,
                            1,
                            charismaLevel,
                          ).credits || 0) >
                          (c.cargo[cargo.id].basePrice.credits || 0),
                        warning:
                          (c.getCargoSellPrice(
                            cargo.id,
                            dataToUse,
                            ship.guildId,
                            1,
                            charismaLevel,
                          ).credits || 0) <
                          (c.cargo[cargo.id].basePrice.credits || 0),
                      }"
                      >{{
                        c.getCargoSellPrice(
                          cargo.id,
                          dataToUse,
                          ship.guildId,
                          1,
                          charismaLevel,
                        ).credits
                      }}</span
                    >)
                  </span>
                </span>
              </div>
            </div>
            <div v-else>
              {{
                c.printList(
                  dataToUse.vendor.cargo.map((cargo) => c.cargo[cargo.id].name),
                )
              }}
            </div>
          </div>
        </div>

        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.items &&
            dataToUse.vendor.items.find((i) => i.type === 'engine')
          "
          class="flexbetween marbottiny"
        >
          <div class="fade marrightsmall">Engines</div>
          <div class="textright">
            {{
              dataToUse.vendor.items.filter(
                (i) => i.type === 'engine' && i.buyMultiplier,
              ).length
            }}
            for sale
          </div>
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.items &&
            dataToUse.vendor.items.find((i) => i.type === 'scanner')
          "
          class="flexbetween marbottiny"
        >
          <div class="fade marrightsmall">Scanners</div>
          <div class="textright">
            {{
              dataToUse.vendor.items.filter(
                (i) => i.type === 'scanner' && i.buyMultiplier,
              ).length
            }}
            for sale
          </div>
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.items &&
            dataToUse.vendor.items.find((i) => i.type === 'communicator')
          "
          class="flexbetween marbottiny"
        >
          <div class="fade marrightsmall">Communicators</div>
          <div class="textright">
            {{
              dataToUse.vendor.items.filter(
                (i) => i.type === 'communicator' && i.buyMultiplier,
              ).length
            }}
            for sale
          </div>
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.items &&
            dataToUse.vendor.items.find((i) => i.type === 'armor')
          "
          class="flexbetween marbottiny"
        >
          <div class="fade marrightsmall">Armor</div>
          <div class="textright">
            {{
              dataToUse.vendor.items.filter(
                (i) => i.type === 'armor' && i.buyMultiplier,
              ).length
            }}
            for sale
          </div>
        </div>
        <div
          v-if="
            dataToUse.vendor &&
            dataToUse.vendor.items &&
            dataToUse.vendor.items.find((i) => i.type === 'weapon')
          "
          class="flexbetween marbottiny"
        >
          <div class="fade marrightsmall">Weapons</div>
          <div class="textright">
            {{
              dataToUse.vendor.items.filter(
                (i) => i.type === 'weapon' && i.buyMultiplier,
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
            ((dataToUse.vendor.shipCosmetics &&
              dataToUse.vendor.shipCosmetics.length) ||
              (dataToUse.vendor.crewCosmetics &&
                dataToUse.vendor.crewCosmetics.length))
          "
          class="flexbetween marbottiny"
        >
          <div class="fade">Cosmetics</div>
          <div>
            {{
              (dataToUse.vendor.shipCosmetics
                ? dataToUse.vendor.shipCosmetics.length
                : 0) +
              (dataToUse.vendor.crewCosmetics
                ? dataToUse.vendor.crewCosmetics.length
                : 0)
            }}
            for sale
          </div>
        </div>

        <div
          v-if="dataToUse.contracts && dataToUse.contracts.length"
          class="flexbetween marbottiny"
        >
          <div class="fade">Contracts</div>
          <div>{{ dataToUse.contracts.length }}</div>
        </div>

        <div
          v-if="
            dataToUse.bank ||
            (ship && ship.banked.find((b) => b.id === dataToUse.id))
          "
          class="flexbetween marbottiny"
        >
          <div class="fade">Bank</div>
          <div>
            {{
              ship && ship.banked.find((b) => b.id === dataToUse.id)
                ? `💳${
                    ship.banked.find((b) => b.id === dataToUse.id).amount
                  } stored`
                : 'available'
            }}
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
    ...mapState(['ship', 'crewMember']),
    dataToUse(): PlanetStub {
      return (
        this.ship?.seenPlanets?.find((p) => p.id === (this.data as any).id) ||
        this.data
      )
    },
    charismaLevel(): number {
      const passiveBoost = this.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc + (p.id === 'boostCharisma' ? p.intensity || 0 : 0),
        0,
      )
      return (
        (this.crewMember.skills.find((s) => s.skill === 'charisma')?.level ||
          1) + passiveBoost
      )
    },
    alliedGuildIds(): string[] {
      const ids: Set<string> = new Set()
      if (this.dataToUse.guildId) {
        ids.add(this.dataToUse.guildId)
      }
      if (this.dataToUse.allegiances) {
        this.dataToUse.allegiances.forEach((a) => {
          if (a.level >= c.guildAllegianceFriendCutoff) ids.add(a.guildId)
        })
      }

      return Array.from(ids)
    },
    showCargoPrices(): boolean {
      return (
        !!(this.ship as ShipStub)?.passives?.find(
          (p) => p.id === 'visibleCargoPrices',
        ) ||
        !!(
          (this.ship as ShipStub)?.passives?.find(
            (p) => p.id === 'broadcastRangeCargoPrices',
          ) &&
          c.distance((this.data as PlanetStub).location, this.ship.location) <
            ((this.ship as ShipStub).radii?.broadcast || 0)
        )
      )
    },
  },
  mounted() {
    c.log(this.dataToUse.vendor?.items)
  },
})
</script>

<style scoped lang="scss">
.planetview {
  width: 200px;
  position: relative;

  & > .header {
    margin: calc(-1 * var(--tooltip-pad-tb)) calc(-1 * var(--tooltip-pad-lr));
    margin-bottom: var(--tooltip-pad-tb);
  }
}
</style>
