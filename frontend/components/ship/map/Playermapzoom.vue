<template>
  <ShipMapPlayermap
    :emoji="'👀'"
    :buffer="false"
    :blackout="false"
    :interactive="false"
    :radius="c.ARRIVAL_THRESHOLD"
    class="grid-item"
    :width="200"
    label="ship vicinity"
  />
</template>

<script>
import c from '../../../../common/src'

export default {
  data() {
    return { c }
  },
}
</script>
