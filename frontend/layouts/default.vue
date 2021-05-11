<template>
  <div>
    <NavBar />
    <Nuxt />
  </div>
</template>

<script lang="ts">
import * as storage from '../assets/scripts/storage'
export default {
  mounted(this: any) {
    const userId = storage.get('userId')
    const shipIds = JSON.parse(
      storage.get('shipIds') || '[]',
    )
    if (userId && shipIds)
      this.$store.commit('set', {
        userId,
        shipIds,
      })
  },
}
</script>

<style></style>
