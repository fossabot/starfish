<template>
  <Box
    class="captainsquarters"
    v-if="show"
    bgImage="/images/paneBackgrounds/20.webp"
  >
    <template #title>
      <span class="sectionemoji">👑</span>Captain's Decree
    </template>

    <div class="panesection" v-if="validOrders">
      <div>
        "<span>{{ validOrders.verb }}</span
        ><span
          v-if="validOrders.target"
          v-tooltip="validOrders.target"
          :style="{ color: validOrders.target.color }"
        >
          <!--{{ validOrders.target.icon || ''
          }}-->
          {{
            validOrders.target.name ||
            validOrders.target.displayName
          }}</span
        ><span v-if="validOrders.addendum">{{
          validOrders.addendum
        }}</span
        ><span v-else>!</span>"

        <div class="sub">- {{ captain.name }}</div>

        <div class="martop" v-if="validOrders">
          <div
            v-for="reaction in [
              '🙌',
              '😱',
              '👀',
              '💪',
              '🍆',
            ]"
            v-if="
              !isCaptain ||
              ship.orderReactions.filter(
                (r) => r.reaction === reaction,
              ).length
            "
            :key="reaction"
            class="reactbutton"
            @click="!isCaptain && react(reaction)"
            v-tooltip="
              ship.orderReactions.filter(
                (r) => r.reaction === reaction,
              ).length
                ? {
                    type: 'reaction',
                    reaction: reaction,
                    orderReactions: ship.orderReactions,
                  }
                : null
            "
            :class="{
              button: !isCaptain,
              buttonlike: isCaptain,
              secondary: !ship.orderReactions.find(
                (r) =>
                  r.id === userId &&
                  r.reaction === reaction,
              ),
            }"
          >
            <span class="emoji">{{ reaction }}</span>
            <span class="sub small">{{
              ship.orderReactions.filter(
                (r) => r.reaction === reaction,
              ).length || ''
            }}</span>
          </div>
        </div>

        <button
          class="martopsmall secondary"
          v-if="validOrders && isCaptain"
          @click="setOrders(true)"
        >
          <span>Clear Orders</span>
        </button>
      </div>
    </div>

    <div
      class="panesection"
      v-if="isCaptain && ship.visible"
    >
      <!-- <div class="panesubhead">Set new orders</div> -->
      <select v-model="verb">
        <option value="">Select a verb...</option>
        <option value="Go to">Go to</option>
        <option
          value="Attack"
          v-if="
            ship.visible.ships.filter(
              (s) => s.guildId !== ship.guildId,
            ).length
          "
        >
          Attack
        </option>
        <option
          value="Run away from"
          v-if="
            ship.visible.ships.filter(
              (s) => s.guildId !== ship.guildId,
            ).length
          "
        >
          Run away from
        </option>
        <option
          value="Get"
          v-if="ship.visible.caches.length"
        >
          Get
        </option>
        <option
          value="Help"
          v-if="ship.visible.ships.length"
        >
          Help
        </option>
        <option
          value="Mine at"
          v-if="ship.seenPlanets.find((p) => p.mine)"
        >
          Mine
        </option>
        <option value="Rest up">Rest</option>
        <option
          value="Repair"
          v-if="
            ship.items.filter((i) => i.repair < 0.95).length
          "
        >
          Repair
        </option>
        <option
          value="Just chill and do whatever, you know, have fun"
        >
          Whatever
        </option>
      </select>

      <select
        v-model="target"
        v-if="['Attack', 'Run away from'].includes(verb)"
      >
        <option value="">Select an enemy...</option>
        <option
          v-for="s in ship.visible.ships
            .filter((vs) => vs.guildId !== ship.guildId)
            .sort(
              (a, b) =>
                c.distance(ship.location, a.location) -
                c.distance(ship.location, b.location),
            )
            .slice(0, 10)"
          :key="'cqo' + s.id"
          :value="{ type: 'ship', id: s.id, name: s.name }"
        >
          {{ s.name }}
        </option>
        <option
          v-for="s in ship.contracts.filter(
            (co) =>
              co.status === 'active' &&
              !ship.visible.ships.find(
                (vs) => vs.id === co.targetId,
              ),
          )"
          :key="'cqo' + s.id"
          :value="{
            type: 'contract',
            id: s.id,
            targetName: s.targetName,
          }"
        >
          {{ s.targetName }}
        </option>
      </select>

      <select
        v-model="target"
        v-if="['Help'].includes(verb)"
      >
        <option value="">Select a ship...</option>
        <option
          v-for="s in ship.visible.ships
            .filter((vs) => vs.id !== ship.id)
            .sort(
              (a, b) =>
                c.distance(ship.location, a.location) -
                c.distance(ship.location, b.location),
            )
            .slice(0, 10)"
          :key="'cqo' + s.id"
          :value="{ type: 'ship', id: s.id, name: s.name }"
        >
          {{ s.name }}
        </option>
      </select>

      <select
        v-model="target"
        v-if="['Get'].includes(verb)"
      >
        <option value="">Select a cache...</option>
        <option
          v-for="s in [...ship.visible.caches]
            .sort(
              (a, b) =>
                c.distance(ship.location, a.location) -
                c.distance(ship.location, b.location),
            )
            .slice(0, 10)"
          :key="'cqo' + s.id"
          :value="{
            type: 'cache',
            id: s.id,
            name: s.name,
            location: s.location,
          }"
        >
          📦Cache (<AngleArrow
            :angle="
              c.angleFromAToB(ship.location, s.location)
            "
          />
          {{
            c.r2(c.distance(ship.location, s.location))
          }}AU)
        </option>
      </select>

      <select
        v-model="target"
        v-if="['Mine at'].includes(verb)"
      >
        <option value="">Select a planet...</option>
        <option
          v-for="s in ship.seenPlanets
            .filter((p) => p.mine)
            .sort(
              (a, b) =>
                c.distance(ship.location, a.location) -
                c.distance(ship.location, b.location),
            )
            .slice(0, 10)"
          :key="'cqo' + (s.id || s.name)"
          :value="{
            type: 'planet',
            name: s.name,
          }"
        >
          🪐{{ s.name }}
        </option>
      </select>

      <select
        v-model="target"
        v-if="['Go to'].includes(verb)"
      >
        <option value="">Select a destination...</option>
        <option
          v-for="s in [
            ...[...ship.seenPlanets]
              .sort(
                (a, b) =>
                  c.distance(ship.location, a.location) -
                  c.distance(ship.location, b.location),
              )
              .slice(0, 10),
            ...[...ship.seenLandmarks]
              .sort(
                (a, b) =>
                  c.distance(ship.location, a.location) -
                  c.distance(ship.location, b.location),
              )
              .slice(0, 10),
            ...[...ship.visible.ships]
              .sort(
                (a, b) =>
                  c.distance(ship.location, a.location) -
                  c.distance(ship.location, b.location),
              )
              .slice(0, 10),
            ...[...ship.visible.caches]
              .sort(
                (a, b) =>
                  c.distance(ship.location, a.location) -
                  c.distance(ship.location, b.location),
              )
              .slice(0, 10),
          ]"
          :key="'cqo' + (s.id || s.name)"
          :value="{
            type: s.type || 'ship',
            id: s.id,
            name: s.name,
          }"
        >
          {{
            s.type === 'ship'
              ? '🚀'
              : s.type === 'planet'
              ? '🪐'
              : s.type === 'cache'
              ? '📦'
              : s.type === 'zone'
              ? '⭕'
              : ''
          }}{{ s.name }}
        </option>
      </select>

      <select
        v-model="target"
        v-if="['Repair'].includes(verb)"
      >
        <option value="">Select equipment...</option>
        <option
          v-for="s in [...ship.items]
            .filter((i) => i.repair < 0.95)
            .sort((a, b) => a.repair - b.repair)"
          :key="'cqo' + s.type + s.id"
          :value="{
            type: s.type,
            id: s.id,
            name: s.displayName,
          }"
        >
          {{ s.displayName }} ({{ c.capitalize(s.type) }})
        </option>
        <option value="">Anything</option>
      </select>

      <select v-model="addendum" v-if="verb">
        <option value="">Select an addendum...</option>
        <option value=", quickly!">Quickly!</option>
        <option value=", but no rush.">No rush.</option>
        <option value=", all together now!">
          All together, now!
        </option>
        <option value=" if you feel like it.">
          If you feel like it.
        </option>
        <option value=" just a little.">
          Just a little.
        </option>
        <option value=", or else!">Or else!</option>
        <option value=", I dare you.">I dare you.</option>
        <option value=", please 🙂">Please 🙂</option>
        <option value=", pretty please 🥺">
          Pretty please 🥺
        </option>
        <option
          v-if="ship.guildId"
          :value="`, in the name of the ${
            c.guilds[ship.guildId].name
          }!`"
        >
          In the name of the
          {{ c.guilds[ship.guildId].name }}!
        </option>
        <option value=", you've earned it.">
          You've earned it.
        </option>
        <option value=", see if I care.">
          See if I care.
        </option>
        <option value=", if you know what I mean 😉">
          IFKWIM 😉
        </option>
      </select>

      <div
        class="martop flexbetween"
        v-if="toValidOrders(inputOrders)"
      >
        <div class="button" @click="setOrders">
          <span>Set Orders</span>
        </div>
      </div>

      <div class="martop sub">
        Only the captain can set orders.
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
    return {
      c,
      verb: '',
      target: '' as any,
      addendum: '',
    }
  },
  computed: {
    ...mapState(['ship', 'userId', 'crewMember']),
    show(): boolean {
      return (
        this.ship &&
        this.ship.crewMembers.length > 1 &&
        this.captain &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes(
            'captainsquarters',
          )) &&
        (this.isCaptain || this.validOrders)
      )
    },
    captain(): CrewMemberStub | undefined {
      return this.ship?.crewMembers.find(
        (cm) => cm.id === this.ship?.captain,
      )
    },
    isCaptain(): boolean {
      return this.captain?.id === this.userId
    },
    inputOrders(): ShipOrders {
      return {
        verb: this.verb,
        target: this.target,
        addendum: this.addendum,
      }
    },
    validOrders(): false | ShipOrders {
      return this.toValidOrders(this.ship.orders)
    },
  },
  watch: {
    verb() {
      this.target = ''
      this.addendum = ''
    },
  },
  mounted() {},
  methods: {
    setOrders(clear = false): void {
      ;(this as any).$socket?.emit(
        'ship:orders',
        this.ship.id,
        this.crewMember?.id,
        clear === true ? null : this.inputOrders,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('notifications/notify', {
            text: clear
              ? `Orders cleared!`
              : `New orders set!`,
            type: 'success',
          })
          this.target = ''
          this.addendum = ''
          this.verb = ''
        },
      )
    },

    react(reaction): void {
      ;(this as any).$socket?.emit(
        'crew:reactToOrder',
        this.ship.id,
        this.crewMember?.id,
        reaction,
      )
    },

    toValidOrders(orders: ShipOrders): false | ShipOrders {
      if (!orders || !this.ship) return false
      const o = { ...orders }
      if (!o.verb) return false
      if (
        [
          'Go to',
          'Attack',
          'Run away from',
          'Get',
          'Help',
          'Mine at',
        ].includes(o.verb) &&
        !o.target
      )
        return false

      if (!o.target) return orders

      const itemTypes: ItemType[] = [
        'weapon',
        'engine',
        'scanner',
        'communicator',
        'armor',
      ]
      if (o.target.type === 'planet') {
        const found = this.ship.seenPlanets.find(
          (s) => s.name === o.target!.name,
        )
        if (!found) return false
        o.target = found
        o.target!.icon = `🪐`
      } else if (o.target!.type === 'zone') {
        const found = this.ship.seenLandmarks.find(
          (s) => s.type === 'zone' && s.id === o.target!.id,
        )
        if (!found) return false
        o.target = found
        o.target!.icon = `⭕`
      } else if (o.target!.type === 'ship') {
        const found = this.ship.visible?.ships.find(
          (s) => s.id === o.target!.id,
        )
        if (!found) return false
        o.target = found
        o.target!.color = c.guilds[found.guildId]?.color
        o.target!.type = 'ship'
      } else if (o.target!.type === 'contract') {
        const found = this.ship.contracts
          ?.filter((co) => co.status === 'active')
          .find((s) => s.id === o.target!.id)
        if (!found) return false
        o.target = found
        o.target!.color =
          c.guilds[
            (found as Contract).targetGuildId || ''
          ]?.color
        o.target!.name = found.targetName
        o.target!.type = 'contract'
      } else if (o.target!.type === 'cache') {
        const found = this.ship.visible?.caches.find(
          (s) => s.id === o.target!.id,
        )
        if (!found) return false
        o.target = found
        o.target!.angle = c.angleFromAToB(
          this.ship.location,
          found.location,
        )
        o.target!.distance = c.distance(
          this.ship.location,
          found.location,
        )
        o.target!.name = `the cache ${c.r2(
          o.target!.distance,
        )}AU away at ${c.r2(o.target!.angle, 0)}deg`
        o.target!.color = `var(--cache)`
      } else if (
        itemTypes.includes(o.target!.type as any)
      ) {
        const found = this.ship.items.find(
          (i) =>
            i.id === o.target!.id &&
            i.type === o.target!.type,
        )
        if (!found) return false
        if (found.repair > 0.95) return false
        o.target = found
        o.target!.color = `var(--item)`
      }

      return o
    },
  },
})
</script>

<style lang="scss" scoped>
.captainsquarters {
  width: 240px;
}

.buttonlike {
  display: inline-block;
  margin-right: 2px;
  margin-bottom: 2px;
  border-radius: 5px;
}
.reactbutton {
  padding: 0em 0.4em;
  background: rgba(white, 0.1);
  .emoji {
    font-size: 1.15em;
  }
}
</style>
