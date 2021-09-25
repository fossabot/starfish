<template>
  <div v-if="data">
    <div>
      <b>{{ data.displayName }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>

    <hr v-if="Object.keys(data).length > 3" />

    <PillBar
      v-if="data.repair && data.maxHp"
      :mini="true"
      :value="data.repair * data.maxHp"
      :max="data.maxHp"
      class="marbotsmall"
    />
    <div v-else-if="data.repair">
      Repair: {{ c.r2(data.repair * 100) }}%
    </div>
    <div v-else-if="data.maxHp">
      Max HP: {{ c.r2(data.maxHp) }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.maxHp"
        :b="data.maxHp"
      />
    </div>

    <!-- chassis -->
    <div v-if="data.slots">
      Equipment Slots: {{ data.slots }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.slots"
        :b="data.slots"
      />
    </div>
    <div v-if="data.agility">
      Passive Dodge Modifier:
      {{ data.agility >= 1 ? '+' : ''
      }}{{ c.r2((data.agility - 1) * 100) + '%' }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.agility * 100"
        :b="data.agility * 100"
        addendum="%"
      />
    </div>
    <div v-if="data.maxCargoSpace">
      Cargo Space / Crew Member:
      {{ data.maxCargoSpace }} tons
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.maxCargoSpace"
        :b="data.maxCargoSpace"
      />
    </div>

    <!-- engine -->
    <div v-if="data.thrustAmplification">
      Base Thrust:
      {{
        c.r2(
          data.thrustAmplification *
            c.baseEngineThrustMultiplier,
        )
      }}P
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="
          compareTo.thrustAmplification *
          c.baseEngineThrustMultiplier
        "
        :b="
          data.thrustAmplification *
          c.baseEngineThrustMultiplier
        "
      />
    </div>
    <div
      v-if="
        data.thrustAmplification &&
        data.repair !== undefined &&
        data.repair !== 1
      "
    >
      Effective Thrust:
      {{
        c.r2(
          data.thrustAmplification *
            data.repair *
            c.baseEngineThrustMultiplier,
        )
      }}P
    </div>

    <!-- scanner -->
    <div v-if="data.sightRange">
      Max Sight Range: {{ data.sightRange }}AU
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.sightRange"
        :b="data.sightRange"
      />
    </div>
    <div v-if="data.shipScanRange">
      Max Ship Scan Range: {{ data.shipScanRange }}AU
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.shipScanRange"
        :b="data.shipScanRange"
      />
    </div>
    <div v-if="data.shipScanData">
      Scannable Properties:
      <div class="marleft">{{ scanPropertyString }}</div>
    </div>

    <!-- weapon -->
    <div v-if="data.cooldownRemaining !== undefined">
      Charge:
      {{
        Math.floor(
          ((data.baseCooldown - data.cooldownRemaining) /
            data.baseCooldown) *
            100,
        )
      }}%
      <ProgressBar
        :micro="true"
        :percent="
          (data.baseCooldown - data.cooldownRemaining) /
          data.baseCooldown
        "
        :dangerZone="-1"
      />
    </div>
    <div v-if="data.type === 'weapon' && data.range">
      Max Range: {{ data.range }}AU
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.range"
        :b="data.range"
      />
    </div>
    <div v-if="data.damage">
      Base Damage: {{ data.damage }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.damage"
        :b="data.damage"
      />
    </div>
    <div v-if="data.baseCooldown">
      Charge Required:
      {{ c.numberWithCommas(data.baseCooldown) }}
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.baseCooldown"
        :b="data.baseCooldown"
        :higherIsBetter="false"
      />
    </div>
    <div v-if="data.cooldownRemaining">
      Charge Progress:
      {{
        c.numberWithCommas(
          c.r2(
            data.baseCooldown - data.cooldownRemaining,
            0,
          ),
        )
      }}
    </div>

    <!-- armor -->
    <div v-if="data.damageReduction">
      Damage Reduction: {{ data.damageReduction * 100 }}%
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.damageReduction * 100"
        :b="data.damageReduction * 100"
        addendum="%"
      />
    </div>

    <!-- communicator -->
    <div v-if="data.type === 'communicator' && data.range">
      Max Broadast Range: {{ data.range }}AU
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.range"
        :b="data.range"
      />
    </div>
    <div v-if="data.antiGarble">
      Clarity Boost: {{ data.antiGarble * 100 }}%
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.antiGarble * 100"
        :b="data.antiGarble * 100"
        addendum="%"
      />
    </div>

    <!-- general -->
    <div v-if="data.type !== 'chassis' && data.maxHp">
      Reliability:
      <span
        v-if="!data.reliability || data.reliability === 1"
        >Normal</span
      >
      <span v-else>
        {{ data.reliability > 1 ? '+' : ''
        }}{{ c.r2(data.reliability - 1) * 100 }}%
      </span>
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="(compareTo.reliability || 1) * 100"
        :b="(data.reliability || 1) * 100"
        addendum="%"
      />
    </div>
    <div v-if="data.type !== 'chassis' && data.maxHp">
      Repair Difficulty:
      <span
        v-if="
          !data.repairDifficulty ||
          data.repairDifficulty === 1
        "
        >Normal</span
      >
      <span v-else>
        {{ data.repairDifficulty > 1 ? '+' : ''
        }}{{ c.r2(data.repairDifficulty - 1) * 100 }}%
      </span>
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="(compareTo.repairDifficulty || 1) * 100"
        :b="(data.repairDifficulty || 1) * 100"
        :higherIsBetter="false"
        addendum="%"
      />
    </div>

    <div v-if="data.mass">
      Mass: {{ c.numberWithCommas(data.mass) }}kg
      <ShipTooltipsCompareProp
        v-if="compareTo"
        :a="compareTo.mass"
        :b="data.mass"
        :higherIsBetter="false"
      />
    </div>

    <hr v-if="data.passives && data.passives.length" />
    <div v-for="passive in data.passives" class="success">
      {{
        c.basePassiveData[passive.id].toString(
          passive.intensity,
          passive,
        )
      }}
    </div>

    <hr v-if="data.description" />
    <div class="sub">{{ data.description }}</div>
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
    compareTo(): any {
      if (!(this.data as any).compare) return
      return this.ship?.items.find(
        (i) => i.type === (this.data as any).type,
      )
    },
    scanPropertyString(): string | undefined {
      let s = ''
      const p: ShipScanDataShape = (this.data as any)
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
  mounted() {},
})
</script>

<style scoped lang="scss"></style>
