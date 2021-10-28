<template>
  <Box
    class="crewoverview"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/15.webp"
  >
    <template #title>
      <span class="sectionemoji">asdf</span>Crew Overview
    </template>

    <div class="crewoverviewholder">
      <Tabs :dropdown="true">
        <Tab
          v-for="cm in ship.crewMembers"
          :key="'cm' + cm.id"
          :title="c.species[cm.speciesId].icon + cm.name"
        >
          <ul>
            <li>
              Last Active:
              {{
                new Date(cm.lastActive).toLocaleDateString()
              }}
            </li>
            <li>
              {{ c.capitalize(c.baseCurrencyPlural) }}: 💳{{
                cm.credits
              }}
            </li>
            <li v-if="cm.inventory.length">
              Cargo:
              <ul>
                <li
                  v-for="i in cm.inventory"
                  :key="cm.id + i.id"
                >
                  {{ c.capitalize(i.id) }}:
                  {{ i.amount }} tons
                </li>
              </ul>
            </li>
            <li v-if="cm.maxCargoSpace">
              Max Cargo Space: {{ cm.maxCargoSpace }} tons
            </li>
            <li>
              Skills:
              <ul>
                <li
                  v-for="skill in cm.skills"
                  :key="cm.id + skill.skill"
                >
                  {{ c.capitalize(skill.skill) }}: Lv.
                  {{ skill.level }}
                </li>
              </ul>
            </li>
          </ul>
        </Tab>
      </Tabs>

      <div class="sub panesection">
        Only the captain can see this information.
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        this.ship.captain === this.userId &&
        this.ship.crewMembers.length > 1 &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('crewOverview'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'crewOverview'
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.crewoverview {
  width: 300px;
  position: relative;
}
.crewoverviewholder {
  max-height: 300px;
  overflow-y: auto;
}
</style>
