<template>
  <div>
    <Nuxt />
  </div>
</template>

<script lang="ts">
export default {
  mounted(this: any) {
    this.$store.dispatch('socketSetup')
  },
}
</script>

<style></style>
