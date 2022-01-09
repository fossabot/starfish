<template>
  <div class="inventory panesection">
    <!-- <div class="panesubhead">Skills</div> -->

    <div
      class="marbotsmall"
      v-tooltip="
        `Level up your skills to gain character levels!<br />
        Raising your character level will unlock new active abilities, as well as increase the power of all of your actives.`
      "
    >
      <h4>
        Lv.
        <NumberChangeHighlighter :number="crewMember.level" />
        <span v-if="c.species[crewMember.speciesId]">
          {{ c.capitalize(c.species[crewMember.speciesId].singular) }}</span
        >
        <span class="sub normal"
          >({{
            crewMember.level * crewMember.skills.length +
            c.r2(levelPercent * crewMember.skills.length)
          }}/{{ (crewMember.level + 1) * crewMember.skills.length }})</span
        >
      </h4>
    </div>

    <div class="grid2" style="grid-gap: 0.2em">
      <ProgressBar
        :mini="true"
        :dangerZone="-1"
        :percent="skill.progress"
        v-for="skill in sortedSkills"
        v-if="skill"
        :key="'skill' + skill.skill"
        v-tooltip="getTooltip(skill)"
      >
        <div class="flexbetween fullwidth">
          <div class="">
            <NumberChangeHighlighter
              :number="c.r2(skill.xp, 0)"
              :display="skillAbbreviations[skill.skill]"
            />
          </div>
          <div class="">
            <span
              class="small fade normal"
              style="font-size: 0.8em; margin-right: 0.2em"
              >Lv.</span
            ><NumberChangeHighlighter
              :number="getLevel(skill).level"
              :class="{ success: getLevel(skill).boost }"
            />
          </div>
        </div>
      </ProgressBar>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    const skillTooltips = {
      strength:
        '<b>Strength</b> improves your weapon damage/charge speed, and also your mining speed. <br /> Earned by charging weapons and mining.',
      dexterity:
        '<b>Dexterity</b> improves engine charge/thrust, as well as your repair speed. <br /> Earned by using thrust and repairing.',
      intellect:
        '<b>Intellect</b> improves your research speed. <br /> Earned by researching.',
      charisma:
        '<b>Charisma</b> improves your broadcast clarity and vendor prices. <br /> Earned by sending broadcasts and trading cargo.',
      endurance:
        '<b>Endurance</b> improves your max stamina. <br /> Earned by being awake and active on the ship.',
      // piloting: `Improves thrust.<br />Earned by using charged thrust.`,
      // munitions: `Improves weapon charge time and attack accuracy, and gives slight priority in choosing tactics and targets.<br />Earned by charging weapons, and for destroying enemies.`,
      // mechanics: `Improves repair speed.<br />Earned by repairing.`,
      // linguistics: `Improves clarity of broadcasts.<br />Earned by sending broadcasts.`,
      // mining: `Improves mine speed.<br />Earned by mining.`,
    }
    const skillAbbreviations = {
      strength: 'STR',
      dexterity: 'DEX',
      intellect: 'INT',
      charisma: 'CHA',
      endurance: 'END',
    }
    return { c, skillTooltips, skillAbbreviations }
  },
  computed: {
    ...mapState(['crewMember', 'ship']),
    sortedSkills(): XPData[] {
      return [...this.crewMember.skills]
        .filter((s) => s)
        .sort((a: XPData, b: XPData) => b.xp - a.xp)
        .map((s: XPData) => {
          const toNext = c.levels[s.level] - s.xp
          const levelSize = c.levels[s.level] - c.levels[s.level - 1]
          const progress = 1 - toNext / levelSize
          return { ...s, progress }
        })
    },
    levelPercent(): number {
      return (
        (this.crewMember.skills.reduce((acc, skill) => acc + skill.level, 0) /
          this.crewMember.skills.length) %
        1
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    getTooltip(skill: XPData) {
      const boost = this.getLevel(skill).boost
      return (
        this.skillTooltips[skill.skill] +
        `<br/><span class="sub martopsmall">${c.numberWithCommas(
          Math.round(skill.xp),
        )} xp</span>` +
        (boost
          ? `<br/><span class="sub success">Boosted by ${boost} level${
              boost === 1 ? '' : 's'
            }</span>`
          : '')
      )
    },
    getLevel(skill: XPData): any {
      const boost =
        this.crewMember.passives.reduce((acc, p) => {
          if (p.id === `boost${c.capitalize(skill.skill)}`)
            return acc + (p.intensity || 0)
          return acc
        }, 0) +
        this.ship.passives.reduce((acc, p) => {
          if (p.id === `flatSkillBoost`) return acc + (p.intensity || 0)
          return acc
        }, 0)
      return {
        level: skill.level + boost,
        xp: skill.xp,
        boost: boost,
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.inventory {
  position: relative;
}
</style>
