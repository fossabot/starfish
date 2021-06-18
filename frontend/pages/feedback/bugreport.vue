<template>
  <div class="container">
    <NavBar />
    <div class="textcolumn">
      <h2>Bug Report</h2>
      <div>
        Also consider creating an issue on the github issues
        page! (link)
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
          <label for="Feedback">Bug Description</label>
          <textarea id="Feedback" ref="Feedback" required />
        </div>

        <input type="submit" value="Submit" />
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'crewMember', 'ship']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    submit(this: ComponentShape) {
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
}
</script>

<style></style>
