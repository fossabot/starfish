<template>
  <nav class="leftbar" :class="{ mobile: isMobile }">
    <div class="placeholder"></div>
    <div class="actualbar flexcolumn flexbetween">
      <div class="flexcolumn flexcenter">
        <nuxt-link class="logoholder" to="/"
          ><img
            src="/images/logo.svg"
            class="logo"
            height="38"
            width="38"
        /></nuxt-link>

        <hr />

        <div
          class="icon guildicon pointer"
          v-for="s in shipsBasics"
          @click="shipSelected(s.id)"
          :class="{ active: ship && ship.id === s.id }"
          v-tooltip="{ type: 'ship', ...s }"
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

      <div class="flexcolumn flexcenter bottombuttons">
        <div
          class="icon subicon smaller pointer martopbig"
          v-tooltip="`About Starfish`"
        >
          <nuxt-link to="/about">
            <img
              src="/images/icons/icon-about.svg"
              alt="link to about page"
              height="25"
              width="25"
            />
          </nuxt-link>
        </div>
        <div
          class="icon subicon smaller pointer martopbig"
          v-tooltip="`How to Play`"
        >
          <nuxt-link to="/howtoplay">
            <img
              src="/images/icons/icon-howtoplay.svg"
              alt="link to how to play page"
              height="25"
              width="25"
            />
          </nuxt-link>
        </div>
        <div
          class="icon subicon smaller pointer martopbig"
          v-tooltip="
            `Discord Support Server: Give feedback, ask questions, submit bug reports.`
          "
        >
          <a :href="c.supportServerLink" target="_blank">
            <img
              src="/images/icons/icon-discord.svg"
              alt="link to discord support server"
              height="25"
              width="25"
            />
          </a>
        </div>
        <div
          v-if="ship && !ship.tutorial && userId"
          class="icon smaller pointer martopbig"
          @click="toTutorial"
          v-tooltip="`Launch Tutorial`"
        >
          <img
            src="/images/icons/icon-tutorial.svg"
            alt="tutorial button"
            height="25"
            width="25"
          />
        </div>
        <hr />
        <div
          class="icon subicon smaller pointer"
          @click="logout"
          v-tooltip="`Log Out`"
          v-if="userId"
        >
          <img
            src="/images/icons/icon-logout.svg"
            alt="log out button"
            height="25"
            width="25"
          />
        </div>
        <div
          class="icon smaller pointer"
          v-tooltip="`Log In`"
          v-else
        >
          <nuxt-link to="/login">
            <img
              src="/images/icons/icon-login.svg"
              alt="log in button"
              height="25"
              width="25"
            />
          </nuxt-link>
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
      'isMobile',
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
    async shipSelected(id) {
      if (this.ship && this.ship.id === id) return
      this.$store.commit('set', {
        loading: true,
        mapFollowingShip: true,
      })
      this.$store.dispatch('socketSetup', id)
    },
    logout() {
      this.$store.dispatch('logout')
    },
    toTutorial() {
      ;(this as any).$socket?.emit(
        'crew:toTutorial',
        this.ship.id,
        this.crewMember?.id,
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.leftbar {
  --bar-width: 53px;
  --icon-width: 38px;
  --tb-pad: 1.5em;

  &.mobile {
    --bar-width: 49px;
    --tb-pad: 0.7em;
  }
}

hr {
  margin: 0.7em auto;
  border: 0;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.22);
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
  padding: var(--tb-pad) 0;
  padding-left: 1px;
  width: var(--bar-width);
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  // border-right: 1px solid rgba(255, 255, 255, 0.1);

  & > * {
    width: 100%;
  }
}

.icon {
  width: var(--icon-width);
  transition: opacity 0.2s;

  &.smaller {
    width: calc(var(--icon-width) - 13px);
  }

  img {
    width: 100%;
  }

  &.subicon {
    opacity: 0.4;

    &:hover {
      opacity: 1;
    }
  }
}

.logo {
  width: var(--icon-width);
}

.guildicon {
  position: relative;
  width: var(--bar-width);
  display: flex;
  justify-content: center;
  margin-bottom: 0.7em;

  .activeicon {
    --activewidth: calc(var(--bar-width) / 18);
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
    .activeicon {
      left: 0;
      top: 30%;
      height: 40%;
    }

    .underimage {
      background: rgba(255, 255, 255, 0.4);
      border-radius: calc(var(--icon-width) / 3.5);
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
