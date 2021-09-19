<template>
  <div class="container">
    <div class="textcolumn">
      <h1>Bug Report</h1>
      <div>
        Please be as descriptive as possible. If you want to
        share a screenshot, please post it on the
        <a :href="c.supportServerLink" target="_blank"
          >support server</a
        >!
      </div>
      <!-- <div>
        Also consider creating an issue on the github issues
        page! (link)
      </div> -->

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
          <label for="Feedback">Bug Description</label>
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
import c from '../../../common/dist'
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
      fetch(`/api/bug/`, {
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
