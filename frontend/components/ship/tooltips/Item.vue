<template>
  <div v-if="dataToUse">
    <div>
      <h3 style="display: inline">
        {{ dataToUse.displayName }}
      </h3>
      <span class="sub">{{
        c.capitalize(dataToUse.type)
      }}</span>
    </div>

    <hr v-if="Object.keys(dataToUse).length > 3" />

    <PillBar
      v-if="dataToUse.repair && dataToUse.maxHp"
      :mini="true"
      :value="dataToUse.repair * dataToUse.maxHp"
      :max="dataToUse.maxHp"
      class="marbotsmall"
    />
    <div v-else-if="dataToUse.repair" class="flexbetween">
      Repair
      <span> {{ c.r2(dataToUse.repair * 100) }}% </span>
    </div>
    <div v-else-if="dataToUse.maxHp" class="flexbetween">
      <span class="sub">Max HP</span>

      <span>
        {{ c.r2(dataToUse.maxHp) }}
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.maxHp"
          :b="dataToUse.maxHp"
        />
      </span>
    </div>

    <!-- chassis -->
    <div v-if="dataToUse.slots" class="flexbetween">
      <span class="sub">Equipment Slots</span>
      <span>
        {{ dataToUse.slots }}
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.slots"
          :b="dataToUse.slots"
        />
      </span>
    </div>
    <div v-if="dataToUse.agility" class="flexbetween">
      <span class="sub">Passive Dodge Modifier</span>
      <span>
        {{ dataToUse.agility >= 1 ? '+' : ''
        }}{{ c.r2((dataToUse.agility - 1) * 100) + '%' }}
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.agility * 100"
          :b="dataToUse.agility * 100"
          addendum="%"
        />
      </span>
    </div>
    <div v-if="dataToUse.maxCargoSpace" class="flexbetween">
      <span class="sub">Cargo Space / Crew Member</span>
      <span>
        {{ dataToUse.maxCargoSpace }}t
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.maxCargoSpace"
          :b="dataToUse.maxCargoSpace"
        />
      </span>
    </div>

    <!-- engine -->
    <div
      v-if="
        (compareTo && dataToUse.type === 'engine') ||
        dataToUse.manualThrustMultiplier
      "
      class="flexbetween"
    >
      <span class="sub">Manual Thrust</span>
      <span>
        {{
          c.r2(
            (dataToUse.manualThrustMultiplier || 0) *
              ship.gameSettings.baseEngineThrustMultiplier,
          )
        }}x
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="
            (compareTo.manualThrustMultiplier || 0) *
            ship.gameSettings.baseEngineThrustMultiplier
          "
          :b="
            (dataToUse.manualThrustMultiplier || 0) *
            ship.gameSettings.baseEngineThrustMultiplier
          "
        />
      </span>
    </div>
    <div
      v-if="
        dataToUse.manualThrustMultiplier &&
        dataToUse.repair !== undefined &&
        dataToUse.repair !== 1
      "
      class="flexbetween"
    >
      <span class="sub">Effective Manual Thrust</span>
      <span>
        {{
          c.r2(
            dataToUse.manualThrustMultiplier *
              dataToUse.repair *
              ship.gameSettings.baseEngineThrustMultiplier,
          )
        }}x
      </span>
    </div>

    <div
      v-if="
        (compareTo && dataToUse.type === 'engine') ||
        dataToUse.passiveThrustMultiplier
      "
      class="flexbetween"
    >
      <span class="sub">Passive Thrust</span>
      <span>
        {{
          c.r2(
            (dataToUse.passiveThrustMultiplier || 0) *
              ship.gameSettings.baseEngineThrustMultiplier,
          )
        }}x
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="
            (compareTo.passiveThrustMultiplier || 0) *
            ship.gameSettings.baseEngineThrustMultiplier
          "
          :b="
            (dataToUse.passiveThrustMultiplier || 0) *
            ship.gameSettings.baseEngineThrustMultiplier
          "
        />
      </span>
    </div>
    <div
      v-if="
        dataToUse.passiveThrustMultiplier &&
        dataToUse.repair !== undefined &&
        dataToUse.repair !== 1
      "
      class="flexbetween"
    >
      <span class="sub">Effective Passive Thrust</span>
      <span>
        {{
          c.r2(
            dataToUse.passiveThrustMultiplier *
              dataToUse.repair *
              ship.gameSettings.baseEngineThrustMultiplier,
          )
        }}x
      </span>
    </div>

    <!-- scanner -->
    <div v-if="dataToUse.sightRange" class="flexbetween">
      <span class="sub">Max Sight Range</span>
      <span>
        {{ c.speedNumber(dataToUse.sightRange, true, 0) }}
        km
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.sightRange * c.kmPerAu"
          :b="dataToUse.sightRange * c.kmPerAu"
        />
      </span>
    </div>
    <div v-if="dataToUse.shipScanRange" class="flexbetween">
      <span class="sub">Max Ship Scan Range</span>
      <span>
        {{
          c.speedNumber(dataToUse.shipScanRange, true, 0)
        }}
        km
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.shipScanRange * c.kmPerAu"
          :b="dataToUse.shipScanRange * c.kmPerAu"
        />
      </span>
    </div>
    <div v-if="dataToUse.shipScanData">
      <div class="marleft">{{ scanPropertyString }}</div>
    </div>

    <!-- weapon -->
    <div
      v-if="dataToUse.cooldownRemaining !== undefined"
      class="flexbetween"
    >
      <span class="sub">Charge</span>
      <span>
        {{
          Math.floor(
            ((dataToUse.baseCooldown -
              dataToUse.cooldownRemaining) /
              dataToUse.baseCooldown) *
              100,
          )
        }}%
      </span>
    </div>
    <ProgressBar
      v-if="dataToUse.cooldownRemaining !== undefined"
      :micro="true"
      :percent="
        (dataToUse.baseCooldown -
          dataToUse.cooldownRemaining) /
        dataToUse.baseCooldown
      "
      :dangerZone="-1"
    />
    <div
      v-if="dataToUse.type === 'weapon' && dataToUse.range"
      class="flexbetween"
    >
      <span class="sub">Max Range</span>
      <span>
        {{ c.speedNumber(dataToUse.range, true, 0) }} km
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.range * c.kmPerAu"
          :b="dataToUse.range * c.kmPerAu"
        />
      </span>
    </div>
    <div v-if="dataToUse.damage" class="flexbetween">
      <span class="sub">Base Damage</span>
      <span>
        {{ dataToUse.damage }}
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.damage"
          :b="dataToUse.damage"
        />
      </span>
    </div>
    <div
      v-if="
        dataToUse.type === 'weapon' &&
        dataToUse.critChance !== undefined
      "
      class="flexbetween"
    >
      <span class="sub">Crit Chance</span>
      <span>
        {{
          (dataToUse.critChance === undefined
            ? ship.gameSettings.baseCritChance
            : dataToUse.critChance) * 100
        }}%
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="
            (compareTo.critChance === undefined
              ? ship.gameSettings.baseCritChance
              : compareTo.critChance) * 100
          "
          :b="
            (dataToUse.critChance === undefined
              ? ship.gameSettings.baseCritChance
              : dataToUse.critChance) * 100
          "
        />
      </span>
    </div>
    <div v-if="dataToUse.baseCooldown" class="flexbetween">
      <span class="sub">Charge Required</span>
      <span>
        {{ c.numberWithCommas(dataToUse.baseCooldown) }}
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.baseCooldown"
          :b="dataToUse.baseCooldown"
          :higherIsBetter="false"
        />
      </span>
    </div>
    <div
      v-if="dataToUse.cooldownRemaining"
      class="flexbetween"
    >
      <span class="sub">Charge Progress</span>
      <span>
        {{
          c.numberWithCommas(
            c.r2(
              dataToUse.baseCooldown -
                dataToUse.cooldownRemaining,
              0,
            ),
          )
        }}
      </span>
    </div>

    <!-- armor -->
    <div
      v-if="dataToUse.damageReduction"
      class="flexbetween"
    >
      <span class="sub">Damage Reduction</span>
      <span>
        {{ dataToUse.damageReduction * 100 }}%
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.damageReduction * 100"
          :b="dataToUse.damageReduction * 100"
          addendum="%"
        />
      </span>
    </div>

    <!-- communicator -->
    <div
      v-if="
        dataToUse.type === 'communicator' && dataToUse.range
      "
      class="flexbetween"
    >
      <span class="sub">Max Broadast Range:</span>
      {{ c.speedNumber(dataToUse.range, true, 0) }} km
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.range * c.kmPerAu"
        :b="dataToUse.range * c.kmPerAu"
      />
    </div>
    <div v-if="dataToUse.antiGarble" class="flexbetween">
      Clarity Boost
      <span>
        {{ dataToUse.antiGarble * 100 }}%
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.antiGarble * 100"
          :b="dataToUse.antiGarble * 100"
          addendum="%"
      /></span>
    </div>

    <!-- general -->
    <div
      v-if="dataToUse.type !== 'chassis' && dataToUse.maxHp"
      class="flexbetween"
    >
      <span class="sub">Reliability</span>
      <span>
        <span
          v-if="
            !dataToUse.reliability ||
            dataToUse.reliability === 1
          "
          >Normal</span
        >
        <span v-else>
          {{ dataToUse.reliability > 1 ? '+' : ''
          }}{{ c.r2(dataToUse.reliability - 1) * 100 }}%
        </span>
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="(compareTo.reliability || 1) * 100"
          :b="(dataToUse.reliability || 1) * 100"
          addendum="%"
      /></span>
    </div>
    <div
      v-if="dataToUse.type !== 'chassis' && dataToUse.maxHp"
      class="flexbetween"
    >
      <span class="sub">Repair Difficulty</span>
      <span>
        <span
          v-if="
            !dataToUse.repairDifficulty ||
            dataToUse.repairDifficulty === 1
          "
          >Normal</span
        >

        <span v-else>
          {{ dataToUse.repairDifficulty > 1 ? '+' : ''
          }}{{
            c.r2(dataToUse.repairDifficulty - 1) * 100
          }}%
        </span>
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="(compareTo.repairDifficulty || 1) * 100"
          :b="(dataToUse.repairDifficulty || 1) * 100"
          :higherIsBetter="false"
          addendum="%"
        />
      </span>
    </div>

    <div v-if="dataToUse.mass" class="flexbetween">
      <span class="sub">Mass</span>
      <span>
        {{
          c.numberWithCommas(c.r2(dataToUse.mass / 1000))
        }}
        ton{{ dataToUse.mass > 1000 ? 's' : '' }}
        <ShipTooltipsCompareProp
          v-if="compareTo"
          :a="compareTo.mass / 1000"
          :b="dataToUse.mass / 1000"
          :higherIsBetter="false"
        />
      </span>
    </div>

    <template
      v-if="dataToUse.passives && dataToUse.passives.length"
    >
      <hr />
      <div
        v-for="passive in dataToUse.passives"
        class="success marbotsmall"
        :class="{
          warning: passive.intensity < 0,
        }"
      >
        {{
          c.baseShipPassiveData[passive.id].description(
            passive,
          )
        }}
      </div>
    </template>

    <hr v-if="dataToUse.description" />
    <div class="sub">{{ dataToUse.description }}</div>
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
    dataToUse() {
      if (
        !this.ship ||
        (this.data as ItemStub).ownerId !== this.ship?.id
      ) {
        if (
          this.data &&
          typeof this.data === 'object' &&
          ((this.data as any).type === 'chassis' ||
            Object.keys(this.data).length < 5)
        )
          return (
            c.items[(this.data as ItemStub).type]?.[
              (this.data as ItemStub).id
            ] || this.data
          )
        return this.data
      }
      return (
        this.ship.items?.find(
          (i) =>
            i.type === (this.data as ItemStub).type &&
            i.id === (this.data as ItemStub).id,
        ) || this.data
      )
    },
    compareTo(): any {
      if (!(this.data as any).compare) return
      if ((this.data as any).type === 'chassis')
        return this.ship.chassis
      return this.ship?.items.find(
        (i) => i.type === (this.data as any).type,
      )
    },
    scanPropertyString(): string | undefined {
      let s = ''
      const p: ShipScanDataShape = (this.dataToUse as any)
        .shipScanData
      if (!p) return

      if (p._hp) s += `HP\n`
      if (p._maxHp) s += `Max HP\n`
      if (p.items)
        s +=
          `Items: ` +
          c.printList(
            p.items.map((e) =>
              c
                .camelCaseToWords(
                  e.replace('displayName', 'Name'),
                )
                .toLowerCase(),
            ),
          ) +
          `\n`
      if (p.targetShip) s += `Attack target\n`
      if (p.rooms) s += `Rooms\n`
      if (p.radii)
        s +=
          `Radii: ` +
          c.printList(
            p.radii.map((e) =>
              c.camelCaseToWords(e).toLowerCase(),
            ),
          ) +
          `\n`
      return s
    },
  },
  mounted() {
    // c.log(this.dataToUse)
  },
})
</script>

<style scoped lang="scss"></style>
