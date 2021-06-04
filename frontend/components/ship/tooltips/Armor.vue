<template>
  <div>
    <div>
      <b>{{ data.displayName }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>
    <hr />
    <div>
      Damage Reduction: {{ data.damageReduction * 100 }}%
    </div>
    <hr />
    <div class="sub">{{ data.description }}</div>
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
