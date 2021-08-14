<template>
  <div class="container">
    <NavPane />

    <div class="textcolumn">
      <h2>How to Play {{ c.gameName }}</h2>
      <h3>Game Objectives</h3>
      <ul>
        <li>
          Explore the universe
        </li>
        <li>
          Earn credits through trade and conquest
        </li>
        <li>
          Upgrade your ship and its equipment
        </li>
        <li>
          Interact with other Discord servers from around
          the world
        </li>
        <li>
          Carve out a safe environment for your faction
        </li>
        <li>
          Build your character's skills
        </li>
        <li>
          Lead your faction to dominance in the global
          faction rankings!
        </li>
      </ul>

      <h3>Getting Started and Joining the Ship</h3>
      <div>
        If you haven't already, add the Discord bot(link) to
        your server.
      </div>
      <div>
        Run the <b>start</b> command in Discord to start
        your server out in the game.
      </div>
      <div>
        Additional crew members can use the
        <b>join</b> command to join the ship.
      </div>

      <h3>Movement</h3>
      <div>
        You must be in the <b>Cockpit</b> to apply thrust to
        the ship.
      </div>
      <div>
        Being in the cockpit slowly charges your personal
        charge of thrust. Other crew members have their own
        separate charges, so don't be shy about using the
        thrust you have!
      </div>
      <ul>
        <li>
          First, set a target by clicking on the large map
          or by clicking a button in the cockpit panel. You
          will see a dotted line appear on the map
          indicating where your target is.
        </li>
        <li>
          Then, click and hold the Thrust button to
          designate the amount of charge you'd like to use.
        </li>
        <li>
          Release the Thrust button to apply thrust! The
          ship will immediately shift its trajectory.
        </li>
      </ul>
      <div>
        You can also slow or stop the ship by using the
        Brake button. The Brake button works in the same way
        as the Thrust button.
      </div>
      <div>
        Braking the ship is easier than thrusting it.
      </div>
      <div>
        The amount of thrust applied is determined by the
        charge you apply, the repair and quality of the
        engines, and the mass of the ship.
      </div>

      <h3>Combat</h3>
      <div>
        You must be in the <b>Weapons Bay</b> to charge or
        fire weapons.
      </div>
      <div>
        Weapons will fire automatically when they are
        charged to 100% and there is a target to attack in
        range.
      </div>
      <div>
        Attack hit chance is determined by the repair of the
        weapon in use, the distance from the target, and the
        target's passive dodge modifier (from their
        chassis). Damage on hit is determined by the repair
        of the weapon in use, the Munitions level of the
        crew members in the Weapons Bay, and the enemy's
        armor.
      </div>
      <div>
        The ship's tactics are determined by the majority of
        tactics of the crew members in the Weapons Bay.
        Thus, all selections made in the Weapons Bay are
        essentially "votes" on what tactic to take.
      </div>
      <div>
        <b>Aggressive</b> tactics will fire at any
        non-faction ship in sight. <b>Defensive</b> tactics
        will only fire back when fired upon.
      </div>
      <div>
        Damage is dealt to armor first, and then to random
        equipment onboard the ship. You can choose to target
        a specific type of equipment to deal damage to it
        directly (after armor) — i.e. to make a quick escape
        you could take out the enemy's engines, or to
        neautralize a threat you could take out their
        weapons first.
      </div>

      <h3>Broadcasting</h3>
      <div>
        Use the <b>#📣comms-bay</b> channel in Discord to
        broadcast a message within your broadcast area. Any
        ships within that range will receive your message,
        in varying degrees of fidelity. Message fidelity is
        based on the broadcast equipment in use, its repair,
        the linguistics skill of the broadcaster, and the
        distance of the receiving ship from the source of
        the broadcast.
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

      <h3>Planets</h3>
      <div>
        Planets are the safe havens, the hubs, the social
        gathering points of {{ c.gameName }}.
      </div>
      <div>
        Planets have a small radius around them. Your ship
        will immediately stop upon entering a planet's
        radius. You cannot attack or be attacked while
        within a planet's radius.
      </div>

      <h3>Caches</h3>
      <div>
        Caches contain cargo. When picked up, they will
        automatically be distributed as evenly as possible
        between all members of the crew.
      </div>
      <div>
        If there is any leftover cargo that cannot be held
        by the crew, it will be dropped into space again as
        a cache.
      </div>

      <h3>Cargo</h3>
      <div>
        Each player has their own cargo space onboard the
        ship. Crew members can buy cargo space upgrades at
        some planets to expand their personal maximum
        capacity up to the limit determined by the ship's
        chassis.
      </div>

      <h3>Buying and Selling</h3>
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
        Planet prices for goods fluctuate over time. If the
        price isn't right today, try again tomorrow!
      </div>
      <div>
        The captain can use the <b>Common Fund</b> to
        purchase equipment and upgrades for the ship. The
        Common Fund must be donated by crew members.
      </div>
      <div>
        Buying and selling at a planet will increase your
        factions allegiance with that planet. With a good
        faction allegiance, planets will give you all kinds
        of bonuses!
      </div>

      <h3>Factions</h3>
      <div>There are four factions in the game.</div>
      <div>In no particular order, they are:</div>
      <ul>
        <li>Green Grapplers</li>
        <li>Purple Pescos</li>
        <li>Blue Breathers</li>
        <li>Bloody Birds</li>
      </ul>
      <div>
        The Bloody Birds are AI-controlled, and are
        aggressive to all aquatic ships.
      </div>
      <div>
        You cannot attack a ship from your own faction.
      </div>

      <h3>Crew Skills</h3>
      <div>
        Your individual character, just like you, gets
        better at various skills as they perform them. They
        will level up in these skills passively by
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
          Lingistics: send broadcasts using your ship's
          communicator
        </li>
      </ul>
      <div>
        As your level in a skill increases, your ability and
        efficacy will increase. For example, someone with a
        high Mechanics level will repair the ship faster
        than someone who hasn't trained the skill.
      </div>

      <h3>Equipment</h3>
      <div>
        Equipment will lose durability on use, or when hit
        by an attack. It will work less and less effectively
        depending on its current durability. Repair your
        equipment to keep your HP high and your ship in
        working order.
      </div>
      <div>
        Hover over a piece of equipment to see its stats.
      </div>
      <div>
        All equipment has mass, which will affect the thrust
        required to move the ship.
      </div>
      <div>
        Having multiple of the same type of equipment will
        continue to give additional bonuses, but with
        diminishing returns. Go ahead, put five engines on
        your ship!
      </div>

      <h3>Repairing</h3>
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
        You will gain <b>Mechanics</b> experience while you
        repair the ship.
      </div>

      <h3>Scanning</h3>
      <div>
        Hover over a ship on the map that is within scan
        range to see basic information about it, or find it
        in the Scan Ship panel to see more details. Hover
        over specific pieces of the ship in the Scan Ship
        panel to see all that your scanning equipment can
        scan. Upgrade to better scanners to see
        more/different information about ships.
      </div>

      <h3>Dying and Respawning</h3>
      <div>
        When a ship's HP reaches zero, it dies. On dying,
        ships will drop a portion of the cargo and credits
        its crew members were carrying as a cache. Whoever
        gets there first can pick up the spoils!
      </div>
      <div>
        The captain can respawn the ship at its faction
        homeworld, with the basic faction loadout. Crew
        members will keep their skills and some of their
        credits, but all equipment and cargo will be lost.
      </div>

      <!-- <h3>Passives</h3>
      <div>There are several passives</div> -->
    </div>
  </div>
</template>

<script lang="ts">
import c from '../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
