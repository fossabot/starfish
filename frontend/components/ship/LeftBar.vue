<template>
  <nav class="leftbar">
    <div class="placeholder"></div>
    <div class="actualbar flexcolumn flexcenter">
      <nuxt-link class="icon marbot" to="/"
        ><img src="/images/logo.svg" class="logo"
      /></nuxt-link>
      <div
        class="icon guildicon marbot"
        v-for="s in shipsBasics"
        :class="{ active: ship && ship.id === s.id }"
        @click="shipSelected(s.id)"
      >
        <div class="underimage flexcenter">
          {{ c.acronym(s.name).substring(0, 3) }}
        </div>
        <div
          class="image"
          :style="{
            'background-image': s.guildIcon
              ? `url('${s.guildIcon}')`
              : '',
          }"
        ></div>
      </div>
    </div>
  </nav>
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
    ...mapState([
      'ship',
      'userId',
      'crewMember',
      'shipIds',
      'shipsBasics',
    ]),
  },
  watch: {},
  mounted() {},
  methods: {
    shipSelected(id) {
      this.$store.dispatch('socketSetup', id)
    },
  },
})
</script>

<style lang="scss" scoped>
.leftbar {
  --bar-width: 50px;
  --icon-width: 35px;
}

.placeholder {
  width: var(--bar-width);
  height: 100vh;
  position: relative;
}

.actualbar {
  background: rgba(0, 0, 0, 0.4);
  align-items: center;
  justify-content: flex-start;
  padding: 1.5em;
  width: var(--bar-width);
  height: 100vh;
  flex-grow: 0;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  & > .icon {
    width: var(--icon-width);
  }
}

.logo {
  width: var(--icon-width);
}

.guildicon {
  position: relative;

  .underimage,
  .image {
    top: 0;
    left: 0;
    overflow: hidden;
    border-radius: calc(var(--icon-width) / 2);
    width: 100%;
    height: var(--icon-width);
  }
  .underimage {
    position: relative;
    font-weight: bold;
  }
  .image {
    position: absolute;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
    background-size: cover;

    transition: box-shadow 0.2s ease-in-out;
  }

  &.active {
    .image {
      box-shadow: 0 0 0 1.5px white;
    }
  }

  &:hover {
    cursor: pointer;

    .image {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
    }
  }
}

a,
a > * {
  display: block;
  margin: 0;
  padding: 0;
}
</style>
