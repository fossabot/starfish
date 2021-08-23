<template>
  <div class="container">
    <div class="textcolumn">
      <h1>Feedback</h1>
      <div>
        Let us know what you think of {{ c.gameName }}!
      </div>

      <form @submit.prevent="submit" ref="form">
        <div>
          <label for="Name">Name</label>
          <input
            id="Name"
            type="text"
            ref="Name"
            required
          />
        </div>

        <div>
          <label for="Email">Email</label>
          <input
            id="Email"
            type="email"
            ref="Email"
            required
          />
        </div>

        <div>
          <label for="Feedback">Feedback</label>
          <textarea
            id="Feedback"
            ref="Feedback"
            class="big"
            required
          />
        </div>

        <input type="submit" class="big" value="Submit" />
      </form>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'crewMember', 'ship']),
  },
  watch: {},
  mounted() {},
  methods: {
    submit() {
      fetch(`/api/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.$refs.Name.value,
          email: this.$refs.Email.value,
          comment: this.$refs.Feedback.value,
          ship: this.ship
            ? `${this.ship?.name} (${this.ship?.id})`
            : '',
          crewMember: this.crewMember
            ? `${this.crewMember?.name} (${this.crewMember?.id})`
            : '',
        }),
      })
      this.$router.push('/feedback/thanks')
    },
  },
})
</script>

<style></style>
