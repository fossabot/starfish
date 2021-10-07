<template>
  <div class="flexcenter flexcolumn">
    <h2>Customize Ship</h2>

    <div class="sub martop marbot">
      Certain in-game achievements will unlock taglines and
      banners!
    </div>

    <h3 class="padtop padbot">Choose Ship Tagline</h3>
    <div class="flexcenter flexwrap marbot">
      <div
        class="preview flexcenter pointer"
        @click="setTagline(null)"
        :class="{ current: !currentTagline }"
      >
        (No tagline)
      </div>
      <div
        class="preview flexcenter pointer"
        :class="{ current: option === currentTagline }"
        v-for="option in ship.availableTaglines || []"
        :key="'to' + option"
        @click="setTagline(option)"
      >
        <div>
          {{ option }}
          <!-- <span v-if="currentTagline === option" class="sub"
            >(Current)</span
          > -->
        </div>
      </div>
    </div>

    <h3 class="padtop padbot">Choose Ship Banner</h3>

    <div class="flexcenter flexwrap">
      <div
        class="preview flexcenter flexcolumn pointer"
        :class="{
          current:
            option.url === currentBanner ||
            (option.id === 'Default' &&
              currentBanner === 'default.svg'),
        }"
        v-for="option in ship.availableHeaderBackgrounds ||
        []"
        :key="'hbgo' + option.id"
        @click="setHeaderBackground(option.id)"
      >
        <img
          :src="'/images/headerBackgrounds/' + option.url"
          :alt="option.id"
        />
        <div class="martopsmall">
          {{ option.id }}
          <!-- <span
            v-if="currentBanner === option.url"
            class="sub"
            >(Current)</span
          > -->
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
    currentTagline() {
      return this.ship?.tagline
    },
    currentBanner() {
      return this.ship?.headerBackground || 'default.svg'
    },
  },
  watch: {},
  mounted() {},
  methods: {
    setHeaderBackground(id: string) {
      Object.values(c.achievements).forEach((a) => {
        if (
          (Array.isArray(a.reward) ? a.reward[0] : a.reward)
            .headerBackground?.id === id
        )
          this.$store.commit('setShipProp', [
            'headerBackground',
            (Array.isArray(a.reward)
              ? a.reward[0]
              : a.reward
            ).headerBackground?.url,
          ])
      })
      ;(this as any).$socket?.emit(
        'ship:headerBackground',
        this.ship.id,
        this.crewMember?.id,
        id,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
          } else {
            this.$store.dispatch('notifications/notify', {
              text: 'Banner set!',
              type: 'success',
            })

            this.$store.commit('set', { modal: null })
          }
        },
      )
    },
    setTagline(tagline: string) {
      this.$store.commit('setShipProp', [
        'tagline',
        tagline,
      ])
      ;(this as any).$socket?.emit(
        'ship:tagline',
        this.ship.id,
        this.crewMember?.id,
        tagline,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
          } else {
            this.$store.dispatch('notifications/notify', {
              text: 'Tagline set!',
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
.preview {
  padding: 1em;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &.current {
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.06);
  }

  img {
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: 230px;
  }
}
</style>
