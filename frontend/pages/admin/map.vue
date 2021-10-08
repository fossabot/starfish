<template>
  <div class="adminmap">
    <ShipCanvasMapAdminView
      :visibleData="visibleData"
      @update="updateMap"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../../common/dist'
import {
  get,
  set,
  remove,
} from '../../assets/scripts/storage'

export default Vue.extend({
  head() {
    return {
      title: 'Admin',
    }
  },
  data() {
    return {
      c,
      show: false,
      visibleData: undefined,
    }
  },
  computed: {
    ...mapState(['userId', 'adminPassword']),
  },
  watch: {},
  async mounted() {
    if (get('adminPassword'))
      this.$store.commit('set', {
        adminPassword: get('adminPassword'),
      })
    if (
      process.env.NODE_ENV !== 'development' &&
      !this.adminPassword
    ) {
      const p = prompt('password')
      this.$store.commit('set', {
        adminPassword: p,
      })
    }

    this.$socket.emit(
      'game:adminCheck',
      this.userId,
      this.adminPassword,
      (isAdmin) => {
        if (isAdmin) {
          this.show = true
          set('adminPassword', this.adminPassword)
          this.updateMap()
        } else {
          this.$store.commit('set', {
            adminPassword: false,
          })
          remove('adminPassword')
          this.$router.replace('/')
        }
      },
    )
  },

  methods: {
    updateMap() {
      this.$socket.emit(
        'admin:map',
        this.userId,
        this.adminPassword,
        (res) => {
          if ('error' in res) return c.log(res.error)

          c.log('updating map')
          this.visibleData = res.data
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.adminmap {
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>
