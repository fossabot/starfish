<template>
  <div class="container">
    <NavBar />
    <h2>This is the homepage</h2>
    <nuxt-link to="/s">Ship Page</nuxt-link>
    <br />
    <nuxt-link to="/login" v-if="!userId"
      >Login Page</nuxt-link
    >
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
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
