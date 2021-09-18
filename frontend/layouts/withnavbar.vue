<template>
  <BaseLayout>
    <NavBar />
    <Nuxt />
  </BaseLayout>
</template>

<script lang="js">
import Vue from 'vue'
import c from '../../common/dist'
import BaseLayout from '~/layouts/default'

export default Vue.extend({
  components: {BaseLayout}
})
</script>

<style lang="scss" scoped></style>
