<template>
  <div class="price">
    <template v-if="data.item">
      <ShipTooltipsItem
        :data="{
          compare: this.data.compare,
          ...data.item.itemData,
        }"
      />
      <hr />
    </template>

    <template v-if="data.chassis">
      <ShipTooltipsChassis
        :data="{
          compare: this.data.compare,
          ...data.chassis.chassisData,
        }"
      />
      <hr />
    </template>
    <template v-if="data.context">
      <div class="sub">{{ data.context }}</div>
      <hr />
    </template>
    <h5>Price modifiers</h5>
    <div v-for="mod in modifiers" class="flexbetween">
      <div class="sub">{{ mod[0] }}</div>
      <div
        :class="{
          success:
            (data.buyOrSell === 'sell' && mod[1] === '+') ||
            (data.buyOrSell === 'buy' && mod[1] !== '+'),
          warning:
            (data.buyOrSell === 'sell' && mod[1] !== '+') ||
            (data.buyOrSell === 'buy' && mod[1] === '+'),
        }"
      >
        {{ mod[1] }}{{ mod[2] }}
      </div>
    </div>

    <hr />

    <div class="flexbetween">
      <div class="sub">Base price</div>
      <div>{{ c.priceToString(basePrice) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    charismaLevel(): number {
      const passiveBoost = this.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc +
          (p.id === 'boostCharisma' ? p.intensity || 0 : 0),
        0,
      )
      return (
        (this.crewMember.skills.find(
          (s) => s.skill === 'charisma',
        )?.level || 1) + passiveBoost
      )
    },
    basePrice(): Price {
      if (this.data.item)
        return (
          c.items[(this.data.item as ItemStub).itemType][
            (this.data.item as ItemStub).itemId
          ]?.basePrice || {}
        )
      if (this.data.chassis)
        return (
          c.items.chassis[
            this.data.chassis.chassisData.chassisId
          ]?.basePrice || {}
        )
      if (this.data.cargoId)
        return (
          (c.cargo[this.data.cargoId] as CargoData)
            ?.basePrice || {}
        )
      if (this.data.passive)
        return (
          c.crewPassives[this.data.passive.data.id]?.buyable
            ?.basePrice || {}
        )
      else return {}
    },
    modifiers(): any[] {
      let modifiers: any[] = []

      const vendorData =
        this.data.planet &&
        this.data.cargoId &&
        (this.data.planet as PlanetStub).vendor?.cargo.find(
          (ca) => ca.id === this.data.cargoId,
        )

      if (this.data.buyOrSell === 'sell') {
        if (this.data.item) {
          modifiers.push([
            'Used item',
            '-',
            `${(1 - c.baseItemSellMultiplier) * 100}%`,
          ])
          if (this.data.item.level > 1)
            modifiers.push([
              `Item level ${this.data.item.level}`,
              `+`,
              `${
                (this.data.item.level - 1) *
                c.itemSellPriceBoostPerLevel *
                100
              }%`,
            ])
        }

        if (vendorData?.sellMultiplier) {
          modifiers.push([
            'Planet cargo sell rate',
            vendorData.sellMultiplier > 1 ? '+' : '',
            `${c.r2(
              (vendorData.sellMultiplier - 1) * 100,
              2,
            )}%`,
          ])
        } else if (this.data.cargoId) {
          modifiers.push([
            'Planet unusual cargo',
            '-',
            `${c.r2(
              (1 - c.baseCargoSellMultiplier) * 100,
              2,
            )}%`,
          ])
        }
      }

      // buy
      else {
        if (
          (this.data.item as PlanetVendorItemPrice)
            ?.buyMultiplier
        )
          modifiers.push([
            'Planet buy rate',
            this.data.item.buyMultiplier > 1 ? '+' : '',
            `${c.r2(
              (this.data.item.buyMultiplier - 1) * 100,
              2,
            )}%`,
          ])

        if (this.data.chassis) {
          if (
            (this.data.chassis as PlanetVendorItemPrice)
              ?.buyMultiplier
          )
            modifiers.push([
              'Planet buy rate',
              this.data.chassis.buyMultiplier > 1
                ? '+'
                : '',
              `${c.r2(
                (this.data.chassis.buyMultiplier - 1) * 100,
                2,
              )}%`,
            ])

          const currentChassisSellPrice = Math.floor(
            ((
              c.items.chassis[
                (this.ship as ShipStub)?.chassis
                  ?.chassisId || 'starter1'
              ]?.basePrice || {}
            ).credits || 0) * c.baseItemSellMultiplier,
          )
          modifiers.push([
            'Chassis trade-in value',
            '-',
            `💳${c.r2(currentChassisSellPrice, 0, true)}`,
          ])
        }

        if (vendorData?.buyMultiplier) {
          modifiers.push([
            'Planet buy rate',
            vendorData.buyMultiplier > 1 ? '+' : '',
            `${c.r2(
              (vendorData.buyMultiplier - 1) * 100,
              2,
            )}%`,
          ])
        }

        if (this.data.passive) {
          const buyAmount = (
            this.data
              .passive as PlanetVendorCrewPassivePrice
          ).intensity
          const baseAmount =
            c.crewPassives[this.data.passive.data.id]
              .buyable?.baseIntensity || 1
          if (buyAmount !== baseAmount)
            modifiers.push([
              `Passive buy amount (${buyAmount}/${baseAmount})`,
              buyAmount > baseAmount ? '+' : '-',
              `${c.r2(
                (1 - buyAmount / baseAmount) * 100,
                2,
              )}%`,
            ])

          if (
            (
              this.data
                .passive as PlanetVendorCrewPassivePrice
            ).buyMultiplier
          ) {
            modifiers.push([
              'Planet passive buy rate',
              this.data.passive.buyMultiplier > 1
                ? '+'
                : '',
              `${c.r2(
                (this.data.passive.buyMultiplier - 1) * 100,
                2,
              )}%`,
            ])
          }

          const currentIntensity =
            (
              this.crewMember as CrewMemberStub
            ).passives?.find(
              (p) => p.id === this.data.passive.data.id,
            )?.intensity || 0

          if (this.crewMember && currentIntensity) {
            modifiers.push([
              'Upgrade level',
              '+',
              `${c.r2(
                (currentIntensity /
                  (c.crewPassives[this.data.passive.data.id]
                    .buyable?.baseIntensity || 1)) **
                  1.5 *
                  100,
                2,
              )}%`,
            ])
          }

          const addCosmeticFromLevel =
            c.crewPassives[this.data.passive.data.id]
              ?.buyable?.scaledCrewCosmeticCurrency
              ?.fromLevel
          const willAddCosmetic =
            addCosmeticFromLevel &&
            currentIntensity /
              (c.crewPassives[this.data.passive.data.id]
                .buyable?.baseIntensity || 1) -
              addCosmeticFromLevel +
              1 >
              0

          if (willAddCosmetic)
            modifiers.push([
              `Base ${c.crewCosmeticCurrencyPlural}`,
              '+',
              `🟡${Math.ceil(
                c.crewPassives[this.data.passive.data.id]
                  ?.buyable?.scaledCrewCosmeticCurrency
                  .amount,
              )}`,
            ])
        }
      }

      if (this.data.planet) {
        modifiers.push([
          `Planet economy fluctuation`,
          ((this.data.planet as PlanetStub)
            .priceFluctuator || 1) -
            1 >
          0
            ? `+`
            : '',
          `${c.r2(
            (((this.data.planet as PlanetStub)
              .priceFluctuator || 1) -
              1) *
              100,
            2,
          )}%`,
        ])

        if (
          ((
            this.data.planet as PlanetStub
          ).allegiances?.find(
            (all) => all.guildId === this.ship.guildId,
          )?.level || 0) > c.guildAllegianceFriendCutoff
        ) {
          modifiers.push([
            `Friendly planet`,
            this.data.buyOrSell === 'sell' ? '+' : `-`,
            `${c.r2(1 - c.guildVendorMultiplier) * 100}%`,
          ])
        }
      }

      if (this.crewMember) {
        modifiers.push([
          `Charisma bonus`,
          this.data.buyOrSell === 'buy' ? '-' : `+`,
          `${c.r2(
            c.lerp(
              0,
              c.maxCharismaVendorMultiplier,
              (this.charismaLevel - 1) / 100,
            ) * 100,
            2,
          )}%`,
        ])
      }

      if (
        this.data.buyOrSell === 'sell' &&
        this.data.cargoId &&
        this.data.planet &&
        this.ship &&
        this.crewMember
      ) {
        const buyPrice =
          c.getCargoBuyPrice(
            this.data.cargoId,
            this.data.planet,
            this.ship.guildId,
            1,
            this.charismaLevel,
          ).credits || 0
        const baseSellPrice =
          c.getCargoSellPrice(
            this.data.cargoId,
            this.data.planet,
            this.ship.guildId,
            1,
            this.charismaLevel,
            true,
          ).credits || 0

        if (
          Math.floor(
            buyPrice * c.cargoBuyPriceProximityLimit,
          ) < baseSellPrice
        )
          modifiers.push([
            'Buy price proximity',
            '-',
            `${c.r2(
              (1 -
                Math.floor(
                  buyPrice * c.cargoBuyPriceProximityLimit,
                ) /
                  baseSellPrice) *
                100,
              2,
            )}%`,
          ])
      }

      return modifiers
    },
  },
})
</script>

<style scoped lang="scss">
.price {
  min-width: 230px;
}
</style>
