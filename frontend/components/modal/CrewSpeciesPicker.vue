<template>
  <div class="flexcenter flexcolumn">
    <h1>Choose Your Species</h1>

    <div class="martop marbotbig flexcenter flexcolumn">
      <h3>Welcome to {{ c.gameName }}!</h3>
      <div>
        Each crew member has a species, which provides
        passive buffs and abilities.
      </div>
      <div>
        Choose a species to join the crew! Your species
        cannot be changed once chosen.
      </div>
    </div>

    <div class="options padtop marbot">
      <div
        class="option flexcenter flexcolumn pointer"
        v-for="species in c.shuffleArray(
          Object.values(c.species).filter((s) => !s.aiOnly),
        )"
        :key="'species' + species.id"
        @click="pickSpecies(species.id)"
      >
        <div class="icon">
          {{ species.icon }}
        </div>
        <h4 class="marnone marbotsmall">
          {{ c.capitalize(species.singular) }}
        </h4>

        <div
          v-for="(p, index) in species.passives"
          :key="'passive' + species.id + index"
          class="success textcenter"
        >
          {{ c.crewPassives[p.id].description(p) }}
        </div>

        <hr />
        <div class="sub textcenter">
          {{ species.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {},
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
  },
  watch: {},
  mounted() {},
  methods: {
    pickSpecies(speciesId: SpeciesId) {},
  },
})
</script>

<style lang="scss" scoped>
.options {
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(
    auto-fill,
    minmax(200px, 1fr)
  );
}

.icon {
  font-size: 3rem;
}
.option {
  padding: 1em;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

hr {
  width: 80%;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: 1em 0;
}
</style>
