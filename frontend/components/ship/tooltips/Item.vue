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
    <div v-else-if="dataToUse.repair">
      Repair: {{ c.r2(dataToUse.repair * 100) }}%
    </div>
    <div v-else-if="dataToUse.maxHp">
      Max HP: {{ c.r2(dataToUse.maxHp) }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.maxHp"
        :b="dataToUse.maxHp"
      />
    </div>

    <!-- chassis -->
    <div v-if="dataToUse.slots">
      Equipment Slots: {{ dataToUse.slots }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.slots"
        :b="dataToUse.slots"
      />
    </div>
    <div v-if="dataToUse.agility">
      Passive Dodge Modifier:
      {{ dataToUse.agility >= 1 ? '+' : ''
      }}{{ c.r2((dataToUse.agility - 1) * 100) + '%' }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.agility * 100"
        :b="dataToUse.agility * 100"
        addendum="%"
      />
    </div>
    <div v-if="dataToUse.maxCargoSpace">
      Cargo Space / Crew Member:
      {{ dataToUse.maxCargoSpace }} tons
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.maxCargoSpace"
        :b="dataToUse.maxCargoSpace"
      />
    </div>

    <!-- engine -->
    <div v-if="dataToUse.thrustAmplification">
      Base Thrust:
      {{
        c.r2(
          dataToUse.thrustAmplification *
            ship.gameSettings.baseEngineThrustMultiplier,
        )
      }}P
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="
          compareTo.thrustAmplification *
          ship.gameSettings.baseEngineThrustMultiplier
        "
        :b="
          dataToUse.thrustAmplification *
          ship.gameSettings.baseEngineThrustMultiplier
        "
      />
    </div>
    <div
      v-if="
        dataToUse.thrustAmplification &&
        dataToUse.repair !== undefined &&
        dataToUse.repair !== 1
      "
    >
      Effective Thrust:
      {{
        c.r2(
          dataToUse.thrustAmplification *
            dataToUse.repair *
            ship.gameSettings.baseEngineThrustMultiplier,
        )
      }}P
    </div>

    <!-- scanner -->
    <div v-if="dataToUse.sightRange">
      Max Sight Range:
      {{ c.speedNumber(dataToUse.sightRange, true, 0) }} km
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.sightRange * c.kmPerAu"
        :b="dataToUse.sightRange * c.kmPerAu"
      />
    </div>
    <div v-if="dataToUse.shipScanRange">
      Max Ship Scan Range:
      {{ c.speedNumber(dataToUse.shipScanRange, true, 0) }}
      km
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.shipScanRange * c.kmPerAu"
        :b="dataToUse.shipScanRange * c.kmPerAu"
      />
    </div>
    <div v-if="dataToUse.shipScanData">
      Scannable Properties:
      <div class="marleft">{{ scanPropertyString }}</div>
    </div>

    <!-- weapon -->
    <div v-if="dataToUse.cooldownRemaining !== undefined">
      Charge:
      {{
        Math.floor(
          ((dataToUse.baseCooldown -
            dataToUse.cooldownRemaining) /
            dataToUse.baseCooldown) *
            100,
        )
      }}%
      <ProgressBar
        :micro="true"
        :percent="
          (dataToUse.baseCooldown -
            dataToUse.cooldownRemaining) /
          dataToUse.baseCooldown
        "
        :dangerZone="-1"
      />
    </div>
    <div
      v-if="dataToUse.type === 'weapon' && dataToUse.range"
    >
      Max Range:
      {{ c.speedNumber(dataToUse.range, true, 0) }} km
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.range * c.kmPerAu"
        :b="dataToUse.range * c.kmPerAu"
      />
    </div>
    <div v-if="dataToUse.damage">
      Base Damage: {{ dataToUse.damage }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.damage"
        :b="dataToUse.damage"
      />
    </div>
    <div
      v-if="
        dataToUse.type === 'weapon' &&
        dataToUse.critChance !== undefined
      "
    >
      Crit Chance:
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
    </div>
    <div v-if="dataToUse.baseCooldown">
      Charge Required:
      {{ c.numberWithCommas(dataToUse.baseCooldown) }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.baseCooldown"
        :b="dataToUse.baseCooldown"
        :higherIsBetter="false"
      />
    </div>
    <div v-if="dataToUse.cooldownRemaining">
      Charge Progress:
      {{
        c.numberWithCommas(
          c.r2(
            dataToUse.baseCooldown -
              dataToUse.cooldownRemaining,
            0,
          ),
        )
      }}
    </div>

    <!-- armor -->
    <div v-if="dataToUse.damageReduction">
      Damage Reduction:
      {{ dataToUse.damageReduction * 100 }}%
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.damageReduction * 100"
        :b="dataToUse.damageReduction * 100"
        addendum="%"
      />
    </div>

    <!-- communicator -->
    <div
      v-if="
        dataToUse.type === 'communicator' && dataToUse.range
      "
    >
      Max Broadast Range:
      {{ c.speedNumber(dataToUse.range, true, 0) }} km
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.range * c.kmPerAu"
        :b="dataToUse.range * c.kmPerAu"
      />
    </div>
    <div v-if="dataToUse.antiGarble">
      Clarity Boost: {{ dataToUse.antiGarble * 100 }}%
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.antiGarble * 100"
        :b="dataToUse.antiGarble * 100"
        addendum="%"
      />
    </div>

    <!-- general -->
    <div
      v-if="dataToUse.type !== 'chassis' && dataToUse.maxHp"
    >
      Reliability:
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
      />
    </div>
    <div
      v-if="dataToUse.type !== 'chassis' && dataToUse.maxHp"
    >
      Repair Difficulty:
      <span
        v-if="
          !dataToUse.repairDifficulty ||
          dataToUse.repairDifficulty === 1
        "
        >Normal</span
      >
      <span v-else>
        {{ dataToUse.repairDifficulty > 1 ? '+' : ''
        }}{{ c.r2(dataToUse.repairDifficulty - 1) * 100 }}%
      </span>
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="(compareTo.repairDifficulty || 1) * 100"
        :b="(dataToUse.repairDifficulty || 1) * 100"
        :higherIsBetter="false"
        addendum="%"
      />
    </div>

    <div v-if="dataToUse.mass">
      Mass:
      {{ c.numberWithCommas(c.r2(dataToUse.mass / 1000)) }}
      tons
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.mass / 1000"
        :b="dataToUse.mass / 1000"
        :higherIsBetter="false"
      />
    </div>

    <hr
      v-if="dataToUse.passives && dataToUse.passives.length"
    />
    <div
      v-for="passive in dataToUse.passives"
      class="success marbotsmall"
    >
      {{
        c.baseShipPassiveData[passive.id].description(
          passive,
        )
      }}
    </div>

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
