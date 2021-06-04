<template>
  <div>
    <div>
      <b>{{ c.capitalize(data.id) }}</b>
    </div>
    <hr />
    <div>{{ data.description }}</div>
  </div>
</template>

<script>
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default {
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
}
</script>

<style scoped lang="scss"></style>
