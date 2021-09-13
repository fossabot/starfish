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
        class="preview flexcenter"
        @click="setTagline(null)"
        :class="{ current: !currentTagline }"
      >
        (No tagline)
      </div>
      <div
        class="preview flexcenter"
        :class="{ current: option === currentTagline }"
        v-for="option in ownedTaglines || []"
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
        class="preview flexcenter flexcolumn"
        :class="{
          current:
            option.url === currentBanner ||
            (option.id === 'Default' &&
              currentBanner === 'default.svg'),
        }"
        v-for="option in ownedHeaderBackgrounds || []"
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
import c from '../../../common/src'
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
    ownedHeaderBackgrounds() {
      return c.headerBackgroundOptions.filter((o) =>
        this.ship?.availableHeaderBackgrounds?.includes(
          o.id,
        ),
      )
    },
    ownedTaglines() {
      return c.taglineOptions.filter((o) =>
        this.ship?.availableTaglines?.includes(o),
      )
    },
    // unownedHeaderBackgrounds() {
    //   return c.headerBackgroundOptions.filter(
    //     (o) =>
    //       !this.ship?.availableHeaderBackgrounds?.includes(
    //         o.id,
    //       ),
    //   )
    // },
  },
  watch: {},
  mounted() {},
  methods: {
    setHeaderBackground(id: string) {
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
      ;(this as any).$socket?.emit(
        'ship:tagline',
        this.ship.id,
        this.crewMember?.id,
        tagline,
        (res: IOResponse<CrewMemberStub>) => {
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
    cursor: pointer;
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
