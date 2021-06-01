<template>
  <div class="appwidenotifications">
    <transition-group name="notification" tag="div">
      <Notification
        v-for="(notification, index) in notifications"
        :key="notification + index"
        v-bind="notification"
      />
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'notifications',
  computed: {
    notifications() {
      return this.$store.state.notifications.list
    },
  },
}
</script>

<style lang="scss">
.appwidenotifications {
  position: fixed;
  width: 0px;
  top: 15px;
  left: 50%;
  z-index: 1000;
  pointer-events: none;
}

.notification-enter {
  opacity: 0;
  transform: translateY(-5px);
}
.notification-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.notification-leave-active {
  position: absolute;
}
</style>
