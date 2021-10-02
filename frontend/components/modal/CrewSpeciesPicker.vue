<template>
  <div class="speciespicker flexcenter flexcolumn">
    <div v-if="!chosenId">
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
            Object.values(c.species).filter(
              (s) => !s.aiOnly,
            ),
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
              c.crewPassives[p.id].description(p)
            }}</span>
          </div>

          <hr />
          <div class="sub textcenter">
            {{ species.description }}
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <h2>Are you sure?</h2>
      <div>
        <div class="icon">
          {{ c.species[chosenId].icon }}
        </div>
        <b>{{
          c.capitalize(c.species[chosenId].singular)
        }}</b
        >'s the species for you, eh?
      </div>
      <button
        class="big martop"
        @click="pickSpecies(chosenId)"
      >
        Yep!
      </button>
      <button
        class="big secondary martop"
        @click="chosenId = null"
      >
        Wait, no...
      </button>
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
    return { c, chosenId: null }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
  },
  watch: {},
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
            console.log(res.error)
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
}
.options {
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(
    auto-fill,
    minmax(180px, 1fr)
  );
}

.icon {
  font-size: 3rem;
}
.option {
  justify-content: flex-start;
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
