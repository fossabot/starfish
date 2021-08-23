<template>
  <div class="container">
    <h1>Admin</h1>
    <nuxt-link to="/s">Ship Page</nuxt-link>
    <br />
    <nuxt-link to="/login" v-if="!userId"
      >Login Page</nuxt-link
    >
    <button @click="save">Save</button>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return {}
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted() {},
  methods: {
    save() {
      this.$socket.emit('game:save')
    },
  },
})
</script>

<style></style>
