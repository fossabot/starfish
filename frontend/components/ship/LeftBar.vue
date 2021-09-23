<template>
  <nav class="leftbar">
    <div class="placeholder"></div>
    <div class="actualbar flexcolumn flexcenter">
      <nuxt-link class="logoholder" to="/"
        ><img src="/images/logo.svg" class="logo"
      /></nuxt-link>

      <hr />

      <div
        class="icon guildicon marbot"
        v-for="s in shipsBasics"
        @click="shipSelected(s.id)"
        :class="{ active: ship && ship.id === s.id }"
      >
        <div class="activeicon"></div>

        <div
          class="iconholder"
          :class="{ active: ship && ship.id === s.id }"
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
  --bar-width: 55px;
  --icon-width: 40px;
}

hr {
  margin: 0.7em auto;
  border: 0;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.2);
  width: 50%;
}

.placeholder {
  width: var(--bar-width);
  height: 100vh;
  position: relative;
}

.actualbar {
  background: rgba(0, 0, 0, 0.4);
  align-items: center;
  padding: 1.5em 0;
  justify-content: flex-start;
  width: var(--bar-width);
  height: 100vh;
  flex-grow: 0;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  border-right: 1px solid rgba(165, 65, 65, 0.1);
}

.logo {
  width: var(--icon-width);
}

.guildicon {
  position: relative;
  width: var(--bar-width);
  display: flex;
  justify-content: center;

  .activeicon {
    --activewidth: calc(var(--bar-width) / 20);
    position: absolute;
    top: 50%;
    left: 0;
    width: var(--activewidth);
    background: white;
    height: 0%;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;

    left: calc(-1 * var(--activewidth));
    transition: left 0.15s ease-in-out,
      top 0.15s ease-in-out, height 0.15s ease-in-out;
  }

  .iconholder {
    position: relative;
    width: var(--icon-width);
    height: var(--icon-width);

    .underimage,
    .image {
      top: 0;
      left: 0;
      overflow: hidden;
      border-radius: calc(var(--icon-width) / 2);
      width: 100%;
      height: 100%;
      transition: background 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out,
        border-radius 0.15s ease-in-out;
    }
    .underimage {
      position: relative;
      font-weight: bold;
      top: 0.037em;
      background: rgba(255, 255, 255, 0.2);
    }
    .image {
      position: absolute;
      // box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
      background-size: cover;
    }
  }

  &.active {
    .underimage {
      background: rgba(255, 255, 255, 0.3);
      border-radius: calc(var(--icon-width) / 3.5);
    }
    .image {
      // box-shadow: 0 0 0 1.5px white;
      box-shadow: none;
      border-radius: calc(var(--icon-width) / 3.5);
    }
  }

  &:hover {
    cursor: pointer;

    .activeicon {
      left: 0;
      top: 30%;
      height: 40%;
    }

    .underimage {
      background: rgba(255, 255, 255, 0.4);
    }

    .image {
      border-radius: calc(var(--icon-width) / 3.5);
    }
  }

  &.active {
    .activeicon {
      left: 0;
      top: 10%;
      height: 80%;
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
