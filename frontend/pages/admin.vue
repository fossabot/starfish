<template>
  <div class="container">
    <NavPane />

    <h2>Admin</h2>
    <nuxt-link to="/s">Ship Page</nuxt-link>
    <br />
    <nuxt-link to="/login" v-if="!userId"
      >Login Page</nuxt-link
    >
    <button @click="save">Save</button>
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
  methods: {
    save() {
      this.$socket.emit('game:save')
    },
  },
}
</script>

<style></style>
