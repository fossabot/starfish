<template>
  <div class="container">
    <NavBar />

    <div class="textcolumn">
      <h2>About {{ c.gameName }}</h2>

      <h3>Remember Earth?</h3>
      <div>
        Humans really did a number on that one, huh?<br />
        They did a pretty good job of wiping each other out,
        though.<br />
        Not that we were left with much after they all died
        off...
      </div>
      <div>
        Us fish had to rush to evolve our brains and
        technology to the point where we could escape from
        the dying planet we were left on.
      </div>
      <div>
        Now, <b>starships full of fish</b> roam the skies,
        colonizing the galaxy with aquatic utopias wherever
        we can.
      </div>
      <div>
        But it's not just fish out here in space. If only!
        Some of the craftier species of birds also made it
        off of Earth. They haven't changed at all — they'll
        hunt down any fish they get their beady little eyes
        on.
      </div>
      <div>
        Besides the fish and the birds, no one's sure who or
        what else managed to make it off of Earth.
      </div>
      <div>
        Back on Earth, you were a big fish in a small pond.
        Now, you find yourself cast into the murky depths of
        the universe. You and your shipmates will have to
        pool your courage to make a splash among the stars.
        Welcome to <b>{{ c.gameName }}</b
        >!
      </div>

      <h3>What is {{ c.gameName }}?</h3>
      <div class="marbot">
        {{ c.gameName }} is
        <b
          >Discord server vs. Discord server space
          action!</b
        >
        It's a game about exploring the universe in a ship
        crewed by your server's members, going on adventures
        and overcoming challenges.
      </div>
      <ul>
        <li>
          Get into huge-scale battles with rival factions of
          real servers on Discord!
        </li>
        <li>
          Communicate (poorly) with ships from all over the
          world!
        </li>
        <li>
          Upgrade your ship, level up your character, and
          trade your way to riches!
        </li>
        <li>And much more!</li>
      </ul>
      <div class="marbot">
        {{ c.gameName }} feels somewhat like a board game.
        Your adventure will take place over the course of
        days and weeks. It's a perfect game for servers with
        members all over the world, who might only have a
        few minutes per day to play.
      </div>

      <div class="martop">
        <h2>Support {{ c.gameName }}!</h2>
        <div>
          {{ c.gameName }} is made by
          <a
            target="_blank"
            href="https://www.jasperstephenson.com"
            >Jasper Stephenson</a
          >
          with help from Xander Madsen and a small
          supporting cast of allies. The game has taken a
          lot of passion and hard work to make! If you like
          it and want to help me have the freedom to
          continue developing it in the future, please
          consider supporting me on
          <a
            target="_blank"
            href="https://www.patreon.com/midblue"
            >Patreon</a
          >!
        </div>
      </div>
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

<style></style>
