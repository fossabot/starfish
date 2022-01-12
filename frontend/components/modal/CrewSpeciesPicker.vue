<template>
  <div class="speciespicker flexcenter flexcolumn">
    <template v-if="!chosenId">
      <h1>Choose Your Species</h1>
      <div class="martop marbotbig flexcenter flexcolumn">
        <h3>Welcome to {{ c.gameName }}!</h3>
        <div>
          Each crew member has a species, which provides passive buffs and
          abilities.
        </div>
        <div>Choose a species to join the crew!</div>
        <div class="martop warning">
          Your species cannot be changed once chosen.
        </div>
      </div>

      <div class="options padtop marbot">
        <div
          class="option flexcenter flexcolumn pointer"
          v-for="species in c.shuffleArray(
            Object.values(c.species).filter((s) => !s.aiOnly),
          )"
          :key="'species' + species.id"
          @click="chosenId = species.id"
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
            <b>{{ c.crewPassives[p.id].displayName }}</b
            >:
            <span class="sub">{{
              c.crewPassives[p.id].description(p, true)
            }}</span>
          </div>

          <div class="martop marbottiny sub">
            <span class="fade">First 3 Unlockable Abilities</span>
          </div>
          <div class="activetree grid3 fullwidth">
            <ShipActive
              v-for="(a, index) in species.activeTree.slice(0, 3)"
              :key="species.id + a.id"
              :active="a"
              :unlockLevel="c.activeUnlockLevels[index]"
            />
          </div>

          <hr />
          <div class="sub textcenter">
            {{ species.description }}
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <h2>Are you sure?</h2>
      <div>
        <div class="icon">
          {{ c.species[chosenId].icon }}
        </div>
        <b>{{ c.capitalize(c.species[chosenId].singular) }}</b
        >'s the species for you, eh?
      </div>
      <div class="flex">
        <button class="big martop marright" @click="pickSpecies(chosenId)">
          <span>Yep!</span>
        </button>
        <button class="big secondary martop" @click="chosenId = null">
          <span>Wait, no...</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {},
  data() {
    return { c, chosenId: null }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
  },
  watch: {
    chosenId() {
      this.$store.commit('tooltip')
    },
  },
  mounted() {},
  methods: {
    pickSpecies(speciesId: SpeciesId) {
      this.$store.commit('updateACrewMember', {
        id: this.crewMember.id,
        speciesId,
      })
      ;(this as any).$socket?.emit(
        'crew:setSpecies',
        this.ship.id,
        this.crewMember?.id,
        speciesId,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
          } else {
            this.$store.dispatch('notifications/notify', {
              text: 'Species set!',
              type: 'success',
            })

            this.$store.commit('set', { modal: null })
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.speciespicker {
  text-align: center;
  width: 100%;
  line-height: 1.3;
}
.options {
  width: 100%;
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.icon {
  font-size: 3.5rem;
}
.option {
  justify-content: flex-start;
  padding: 1em;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.activetree {
  max-width: 150px;
  grid-gap: 0.8em;
}

hr {
  width: 80%;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: 1em 0;
}
</style>
