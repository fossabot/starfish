<template>
  <div class="adminmap">
    <div style="position: relative">
      <AdminMap
        :visibleData="visibleData"
        @update="updateMap"
        @click="click"
      />
    </div>
    <div class="padbig right">
      <div v-if="selectedElement">
        <div>
          {{ selectedElement.name }}
          <span class="sub">{{
            selectedElement.type
          }}</span>
        </div>
        <div class="sub">{{ selectedElement.id }}</div>
        <div class="flex flexwrap" v-if="selectedElement">
          <div class="button" @click="deleteElement">
            <span>Delete</span>
          </div>
          <div v-if="!awaitingCoordinates" class="flex">
            <div
              class="button"
              v-if="selectedElement"
              @click="awaitingCoordinates = 'move'"
            >
              <span>Move</span>
            </div>
          </div>

          <template
            v-if="['ship'].includes(selectedElement.type)"
          >
            <template v-if="selectedElement.ai === false">
              <div
                class="button"
                @click="
                  give([
                    { id: 'credits', amount: 100000 },
                    {
                      id: 'shipCosmeticCurrency',
                      amount: 100,
                    },
                    {
                      id: 'crewCosmeticCurrency',
                      amount: 100000,
                    },
                  ])
                "
              >
                <span>Give currency</span>
              </div>
            </template>
            <template v-if="selectedElement.ai === false">
              <div
                class="button"
                @click="give([{ id: 'salt', amount: 10 }])"
              >
                <span>Give Salt</span>
              </div>
            </template>

            <div class="button" @click="kill">
              <span>Kill</span>
            </div>
          </template>

          <template
            v-if="
              ['planet', 'comet'].includes(
                selectedElement.type,
              )
            "
          >
            <div class="button" @click="levelUpOnePlanet">
              <span>+1 Level</span>
            </div>
            <div class="button" @click="reLevelOnePlanet">
              <span>Reset Level</span>
            </div>
          </template>
        </div>
        <div v-if="!selectedElement">
          Awaiting coordinates to {{ awaitingCoordinates }}
        </div>

        <div class="martopbig sub">
          {{ selectedElement }}
        </div>
      </div>
      <div v-else class="sub">Nothing selected</div>
    </div>
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
      selectedElement: undefined,
      awaitingCoordinates: false,
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
    click({ coordinates, selected }) {
      if (!this.awaitingCoordinates) {
        this.selectedElement = selected
        this.$store.commit('targetPoint', selected)
      }

      if (this.awaitingCoordinates === 'move') {
        this.$socket.emit(
          'admin:move',
          this.userId,
          this.adminPassword,
          this.selectedElement.type,
          this.selectedElement.id,
          coordinates,
          (res) => {
            if ('error' in res) {
              this.$store.dispatch('notifications/notify', {
                text: res.error,
                type: 'error',
              })
              c.log(res.error)
              return
            }
            this.$store.dispatch('notifications/notify', {
              text: 'Moved!',
              type: 'success',
            })
            setTimeout(() => {
              this.updateMap()
            }, 200)
          },
        )
      }

      if (this.awaitingCoordinates) {
        this.awaitingCoordinates = false
        this.$store.commit('targetPoint', null)
        this.selectedElement = null
      }
    },

    deleteElement() {
      if (!this.selectedElement)
        return this.$store.dispatch(
          'notifications/notify',
          {
            text: 'Nothing selected.',
            type: 'error',
          },
        )
      this.$socket.emit(
        'admin:delete',
        this.userId,
        this.adminPassword,
        this.selectedElement.type,
        this.selectedElement.id,
        (res) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
          this.$store.dispatch('notifications/notify', {
            text: 'Deleted!',
            type: 'success',
          })

          this.awaitingCoordinates = false
          this.$store.commit('targetPoint', null)
          this.selectedElement = null

          setTimeout(() => {
            this.updateMap()
          }, 200)
        },
      )
    },

    give(cargo) {
      this.$socket.emit(
        'admin:give',
        this.userId,
        this.adminPassword,
        this.selectedElement.id,
        cargo,
      )
    },

    kill() {
      this.$socket.emit(
        'admin:kill',
        this.userId,
        this.adminPassword,
        this.selectedElement.id,
      )
    },

    reLevelOnePlanet() {
      this.$socket.emit(
        'game:reLevelOnePlanet',
        this.userId,
        this.adminPassword,
        this.selectedElement.id,
      )
    },

    levelUpOnePlanet() {
      c.log(this.selectedElement.id)
      this.$socket.emit(
        'game:levelUpOnePlanet',
        this.userId,
        this.adminPassword,
        this.selectedElement.id,
      )
    },

    updateMap() {
      c.log('updating map...')
      this.$socket.emit(
        'admin:map',
        this.userId,
        this.adminPassword,
        (res) => {
          if ('error' in res) return c.log(res.error)

          c.log('updated map!')
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
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 300px;

  & > * {
    overflow: hidden;
  }
}

.right {
  overflow-y: auto;
  padding-bottom: 300px !important;
}
</style>
