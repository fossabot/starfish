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
    </div>

    <!-- chassis -->
    <div v-if="data.slots">
      Equipment Slots: {{ data.slots }}
    </div>
    <div v-if="data.agility">
      Passive Dodge Modifier:
      {{ c.r2((data.agility - 1) * 100) + '%' }}
    </div>
    <div v-if="data.maxCargoSpace">
      Max Cargo Space Per Crew Member:
      {{ data.maxCargoSpace }}
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
    </div>
    <div v-if="data.shipScanRange">
      Max Ship Scan Range: {{ data.shipScanRange }}AU
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
    <div v-if="data.range">
      Max Range: {{ data.range }}AU
    </div>
    <div v-if="data.damage">
      Base Damage: {{ data.damage }}
    </div>
    <div v-if="data.baseCooldown">
      Charge Required:
      {{ c.numberWithCommas(data.baseCooldown) }}
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
    </div>

    <!-- communicator -->
    <div v-if="data.range">
      Max Broadast Range: {{ data.range }}AU
    </div>
    <div v-if="data.antiGarble">
      Clarity Boost: {{ data.antiGarble * 100 }}%
    </div>

    <!-- general -->
    <div v-if="data.reliability">
      Reliability: {{ data.reliability * 100 }}%
    </div>
    <div
      v-if="
        data.repairDifficulty && data.repairDifficulty !== 1
      "
    >
      Repair Difficulty:
      {{ data.repairDifficulty >= 1 ? '+' : ''
      }}{{ c.r2(data.repairDifficulty - 1) * 100 }}%
    </div>

    <div v-if="data.mass">
      Mass: {{ c.numberWithCommas(data.mass) }}kg
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

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
})
</script>

<style scoped lang="scss"></style>
