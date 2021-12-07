<template>
  <div class="container masonrycontainer" ref="container">
    <Box style="width: 300px" :minimizable="false">
      <div class="flexcenter flexcolumn">
        <img
          src="/images/logo.svg"
          style="width: 5em"
          class="logo padbotsmall padtopsmall"
        />
        <h1 class="marnone padbot">
          <span>How to Play</span>
        </h1>
      </div>
    </Box>
    <Box
      style="width: 400px"
      bgImage="/images/paneBackgrounds/1.webp"
    >
      <template #title>
        <span class="sectionemoji">✅</span>Game Objectives
      </template>

      <div class="panesection textcolumn">
        <ul>
          <li>Explore the universe</li>
          <li>Make money through trade and conquest</li>
          <li>Upgrade your ship and its equipment</li>
          <li>
            Interact with other Discord servers from around
            the world
          </li>
          <li>
            Carve out a safe environment for your guild
          </li>
          <li>Build your character's skills</li>
          <li>
            Lead your guild to dominance in the global guild
            rankings!
          </li>
        </ul>
      </div>
    </Box>
    <Box
      style="width: 500px"
      bgImage="/images/paneBackgrounds/2.webp"
    >
      <template #title>
        <span class="sectionemoji">👋</span>Getting Started
      </template>

      <div class="panesection textcolumn">
        <div>
          If you haven't already,
          <a :href="c.discordBotInviteUrl" target="_blank"
            >add the Discord bot to your server</a
          >.
        </div>
        <div>
          Use the <b>help</b> command (<code>.help</code>)
          to see a list of all of the bot's Discord
          commands.
        </div>
        <div>
          Run the <b>start</b> command in Discord
          (<code>.start</code>) to start your server out in
          the game.
        </div>
        <div>
          Additional crew members can use the
          <b>join</b> command (<code>.join</code>) to join
          the ship.
        </div>
      </div>
    </Box>

    <Box
      style="width: 500px"
      bgImage="/images/paneBackgrounds/3.webp"
    >
      <template #title>
        <span class="sectionemoji">🛫</span>Movement
      </template>

      <div class="panesection textcolumn">
        <div>
          You must be in the <b>Cockpit</b> to apply thrust
          to the ship.
        </div>
        <div>
          There are two types of engines: passive and
          manual. Passive engines apply thrust in your
          target direction as long as you are in the
          cockpit.
        </div>
        <div>
          For manual engines, being in the cockpit slowly
          charges your personal charge of thrust. Other crew
          members have their own separate charges, so don't
          be shy about using the thrust you have!
        </div>
        <ul>
          <li>
            First, set a target by clicking on the large map
            or by clicking a button in the cockpit panel.
            You will see a dotted line appear on the map
            indicating where your target is.
          </li>
          <li>
            If you only have passive engines, you're done!
            If you have manual engines, click and hold the
            Thrust button to designate the amount of charge
            you'd like to use.
          </li>
          <li>
            Release the Thrust button to apply thrust! The
            ship will immediately shift its trajectory.
          </li>
        </ul>
        <div>
          For manual engine users, you can also slow or stop
          the ship by using the Brake button. The Brake
          button works in the same way as the Thrust button.
          For passive engines, setting your target to "Stop"
          will begin to stop the ship.
        </div>
        <div>
          Braking the ship is more powerful than thrusting
          it.
        </div>
        <div>
          The amount of thrust applied is determined by the
          charge you apply, the repair and quality of the
          engines, and the mass of the ship.
        </div>
      </div>
    </Box>

    <Box
      style="width: 400px"
      bgImage="/images/paneBackgrounds/4.webp"
    >
      <template #title>
        <span class="sectionemoji">⚔️</span>Combat
      </template>

      <div class="panesection textcolumn">
        <div>
          You must be in the <b>Weapons Bay</b> to charge or
          fire weapons.
        </div>
        <div>
          Weapons will fire automatically when they are
          charged to 100% and there is a valid target to
          attack in range.
        </div>
        <div>
          Attack hit chance is determined by the repair of
          the weapon in use, the distance from the target,
          and the target's passive dodge modifier (from
          their chassis). Damage on hit is determined by the
          repair of the weapon in use, the Munitions level
          of the crew members in the Weapons Bay, and the
          enemy's armor.
        </div>
        <div>
          The ship's tactics are determined by the majority
          of tactics of the crew members in the Weapons Bay.
          Thus, all selections made in the Weapons Bay are
          essentially "votes" on what tactic to take.
        </div>
        <div>
          <b>Aggressive</b> tactics will fire at any
          attackable ship (not in your guild, on a safe
          haven planet, etc) in sight.
          <b>Defensive</b> tactics will only fire back when
          fired upon. The strategies for other tactics can
          be checked by hovering over them in the Weapons
          Bay.
        </div>
        <div>
          Damage is dealt to armor first, and then to random
          equipment onboard the ship. You can choose to
          target a specific type of equipment to deal damage
          to it directly (after armor) — i.e. to make a
          quick escape you could take out the enemy's
          engines, or to neautralize a threat you could take
          out their weapons first.
        </div>
      </div>
    </Box>

    <Box
      style="width: 400px"
      bgImage="/images/paneBackgrounds/5.webp"
    >
      <template #title>
        <span class="sectionemoji">📣</span>Broadcasting
      </template>

      <div class="panesection textcolumn">
        <div>
          Use the <b>#📣comms-bay</b> channel in Discord to
          broadcast a message within your broadcast area.
          Any ships within that range will receive your
          message, in varying degrees of fidelity. Message
          fidelity is based on the broadcast equipment in
          use, its repair, the linguistics skill of the
          broadcaster, and the distance of the receiving
          ship from the source of the broadcast.
        </div>
        <div>
          On sending a broadcast, the discord bot will react
          to it with a number indicating how many ships
          received the message.
        </div>
        <div>
          Received messages will also be sent to the
          <b>#📣comms-bay</b> channel in Discord.
        </div>
      </div>
    </Box>

    <Box
      style="width: 350px"
      bgImage="/images/paneBackgrounds/6.webp"
    >
      <template #title>
        <span class="sectionemoji">💰</span>Making Money
      </template>

      <div class="panesection textcolumn">
        <div>
          There are many ways to make money in
          {{ c.gameName }}.
        </div>
        <div>
          The easiest way to make money is to sell cargo to
          a merchant planet. You can buy or mine cargo from
          planets, find it in caches, or destroy other ships
          to take their cargo. Planets' cargo prices change
          often, so keep checking back if the current buy
          price is too low.
        </div>
        <div>
          There are other ways to make money, but you'll
          have to explore to find them!
        </div>
      </div>
    </Box>

    <Box
      style="width: 400px"
      bgImage="/images/paneBackgrounds/7.webp"
    >
      <template #title>
        <span class="sectionemoji">🪐</span>Planets
      </template>

      <div class="panesection textcolumn">
        <div>
          Planets are the the hubs of {{ c.gameName }}.
        </div>
        <div>
          Planets have a small radius around them. Your ship
          will immediately stop upon entering a planet's
          radius. If the planet is a safe haven, you cannot
          attack or be attacked while within that planet's
          radius.
        </div>
        <div>
          There are many things that can be done on planets,
          and you'll have to explore to find all of them!
        </div>
        <div>
          Crew members can contribute to planets to help
          their economy grow. As planets grow, they will
          gain various bonuses to what's available there and
          other passive effects. Some planets also have
          inclinations towards certain upgrade types.
        </div>
      </div>
    </Box>

    <Box
      style="width: 300px"
      bgImage="/images/paneBackgrounds/8.webp"
    >
      <template #title>
        <span class="sectionemoji">📦</span>Caches
      </template>

      <div class="panesection textcolumn">
        <div>
          Caches contain cargo. When picked up, they will
          automatically be distributed as evenly as possible
          between all members of the crew.
        </div>
        <div>
          If there is any leftover cargo that cannot be held
          by the crew, it will be dropped into space again
          as a cache.
        </div>
      </div>
    </Box>

    <Box
      style="width: 250px"
      bgImage="/images/paneBackgrounds/9.webp"
    >
      <template #title>
        <span class="sectionemoji">📦</span>Cargo
      </template>

      <div class="panesection textcolumn">
        <div>
          Each player has their own cargo space onboard the
          ship. Crew members can buy cargo space upgrades at
          some planets to expand their personal maximum
          capacity up to the limit determined by the ship's
          chassis.
        </div>
      </div>
    </Box>

    <Box
      style="width: 450px"
      bgImage="/images/paneBackgrounds/10.webp"
    >
      <template #title>
        <span class="sectionemoji">⚖️</span>Buying and
        Selling
      </template>

      <div class="panesection textcolumn">
        <div>
          At a planet, you can buy and sell all sorts of
          things:
        </div>
        <ul>
          <li>
            Equipment, chassis, and other upgrades for the
            ship
          </li>
          <li>Cosmetics for the ship</li>
          <li>Repairs for the ship</li>
          <li>Cargo for crew members</li>
          <li>Passive upgrades for crew members</li>
          <li>And more!</li>
        </ul>
        <div>
          Planet prices for goods fluctuate over time. If
          the price isn't right today, try again tomorrow!
        </div>
        <div>
          The captain can use the <b>Common Fund</b> to
          purchase equipment and upgrades for the ship. The
          Common Fund must be donated by crew members.
        </div>
        <div>
          Buying and selling at a planet will increase your
          guilds allegiance with that planet. With a good
          guild allegiance, planets will give you all kinds
          of bonuses!
        </div>
      </div>
    </Box>

    <Box
      style="width: 400px"
      bgImage="/images/paneBackgrounds/11.webp"
    >
      <template #title>
        <span class="sectionemoji">🚩</span>Guilds
      </template>

      <div class="panesection textcolumn">
        <div>
          There are several guilds in the game. Being a
          member of a guild gives passive benefits to your
          ship, and stops you from attacking other members
          of the same guild.
        </div>
        <div>
          Your ship can join a guild by visiting its
          homeworld. Your first guild is free to join, but
          changing guilds will cost you.
        </div>
        <div>
          <div>
            The guilds (and their respective bonuses) are:
          </div>

          <div class="marleft">
            <div
              v-for="g in Object.values(c.guilds).filter(
                (g) => !g.aiOnly,
              )"
            >
              <div
                class="bold marbotnone"
                :style="{ color: g.color }"
              >
                {{ g.name }}
              </div>
              <ul class="martopnone">
                <li v-for="p in g.passives" :key="p.id">
                  {{
                    c.baseShipPassiveData[p.id].description(
                      p,
                    )
                  }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Box>

    <Box
      style="width: 350px"
      bgImage="/images/paneBackgrounds/12.webp"
    >
      <template #title>
        <span class="sectionemoji">🐟</span>Crew Species
      </template>

      <div class="panesection textcolumn">
        <div>
          Your individual character has a species. Each
          species has a specialty, but every species can do
          any task. Ships can be made up of any combination
          of species.
        </div>
        <div>
          Choose your species from your ship's console after
          you <code>.join</code> the crew. Your species
          cannot be changed once chosen (or can it?)
        </div>
      </div>
    </Box>

    <Box
      style="width: 420px"
      bgImage="/images/paneBackgrounds/13.webp"
    >
      <template #title>
        <span class="sectionemoji">💪</span>Crew Skills
      </template>

      <div class="panesection textcolumn">
        <div>
          Your individual character, just like you, gets
          better at various skills as they perform them.
          They will level up in these skills passively by
          performing tasks on the ship.
        </div>
        <ul>
          <li>Piloting: charge thrust in the Cockpit</li>
          <li>
            Munitions: charge weapons in the Weapons Bay
          </li>
          <li>
            Mechanics: repair equipment in the Repair Bay
          </li>
          <li>
            Mining: mine a planet's surface in the Mining
            Bay
          </li>
          <li>
            Lingistics: send broadcasts using your ship's
            communicator
          </li>
        </ul>
        <div>
          As your level in a skill increases, your ability
          and efficacy will increase. For example, someone
          with a high Mechanics level will repair the ship
          faster than someone who hasn't trained the skill.
        </div>
      </div>
    </Box>

    <Box
      style="width: 350px"
      bgImage="/images/paneBackgrounds/14.webp"
    >
      <template #title>
        <span class="sectionemoji">🛡</span>Equipment
      </template>

      <div class="panesection textcolumn">
        <div>
          Equipment will lose durability on use, or when hit
          by an attack. It will work less and less
          effectively depending on its current durability.
          Repair your equipment to keep your HP high and
          your ship in working order.
        </div>
        <div>
          Hover over a piece of equipment to see its stats.
        </div>
        <div>
          All equipment has mass, which will affect the
          thrust required to move the ship.
        </div>
        <div>
          Having multiple of the same type of equipment will
          continue to give additional bonuses, but with
          diminishing returns. Go ahead, put five engines on
          your ship!
        </div>
      </div>
    </Box>

    <Box
      style="width: 300px"
      bgImage="/images/paneBackgrounds/15.webp"
    >
      <template #title>
        <span class="sectionemoji">🛠</span>Repairing
      </template>

      <div class="panesection textcolumn">
        <div>
          Go to the <b>Repair Bay</b> to repair your ship's
          equipment. You can target the specific type of
          equipment you'd like to repair first.
        </div>
        <div>
          Some pieces of equipment are easier to repair than
          others.
        </div>
        <div>
          You will gain <b>Mechanics</b> experience while
          you repair the ship.
        </div>
      </div>
    </Box>

    <Box
      style="width: 350px"
      bgImage="/images/paneBackgrounds/16.webp"
    >
      <template #title>
        <span class="sectionemoji">📡</span>Scanning
      </template>

      <div class="panesection textcolumn">
        <div>
          Hover over a ship on the map that is within scan
          range to see basic information about it, or find
          it in the Scan Ship panel to see more details.
          Hover over specific pieces of the ship in the Scan
          Ship panel to see all of the data that your
          scanning equipment has uncovered. Upgrade to
          better scanners to see more/different information
          about ships.
        </div>
      </div>
    </Box>

    <Box
      style="width: 390px"
      bgImage="/images/paneBackgrounds/17.webp"
    >
      <template #title>
        <span class="sectionemoji">💥</span>Dying and
        Respawning
      </template>

      <div class="panesection textcolumn">
        <div>
          When a ship's HP reaches zero, it dies. On dying,
          ships will drop a portion of the cargo and
          currency its crew members were carrying as a
          cache. Whoever gets there first can pick up the
          spoils!
        </div>
        <div>
          The captain can respawn the ship at its guild
          homeworld, with the basic guild loadout. Crew
          members will keep their skills and some of their
          💳{{ c.baseCurrencyPlural }}, but all equipment
          and cargo will be lost.
        </div>

        <!-- <h3>Passives</h3>
      <div>There are several passives</div></details> -->
      </div>
    </Box>

    <Box
      style="width: 300px"
      bgImage="/images/paneBackgrounds/18.webp"
    >
      <template #title>
        <span class="sectionemoji">❓</span>Still have
        questions?
      </template>

      <div class="panesection textcolumn">
        <div>
          Feel free to reach out on the
          <a :href="c.supportServerLink" target="_blank"
            >support server</a
          >!
        </div>
      </div>
    </Box>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'
import { mapState } from 'vuex'
import FreeMase from '../assets/scripts/freemase'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted() {
    new FreeMase(this.$refs.container, {
      centerX: true,
    })
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
}
</style>
