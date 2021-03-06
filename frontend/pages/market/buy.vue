<template>
  <div class="container masonrycontainer" ref="container">
    <Box
      style="width: 550px"
      :minimizable="false"
      bgImage="/images/paneBackgrounds/21.webp"
    >
      <template #title> <span class="sectionemoji"></span>B </template>

      <div class="panesection textcolumn">
        <form id="payment-form" @submit="handleSubmit">
          <input type="text" id="email" placeholder="Enter email address" />
          <div id="payment-element">
            <!--Stripe.js injects the Payment Element-->
          </div>
          <button id="submit">
            <div class="spinner hidden" id="spinner"></div>
            <span id="button-text">Pay now</span>
          </button>
          <div id="payment-message" class="hidden"></div>
        </form>
      </div>
    </Box>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'
import FreeMase from '../../assets/scripts/freemase'

export default Vue.extend({
  data() {
    return {
      c,
      stripe: undefined,
      items: [{ id: 'testItem' }],
      elements: undefined,
    }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  async mounted() {
    new FreeMase(this.$refs.container, {
      centerX: true,
    })

    if (process.client === false) return
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = () => {
      c.log('stripe script loaded')
      this.stripe = window.Stripe(
        'pk_test_51KFoQXJcHCUKgymmmdQj9LxQghigBRCCN5rH4b7oYeVm1evqNTHMiABs77nhMNmLZEl3HfK6ntoLVGgw0kwRCkjQ00Cq9KGd6w',
      )

      this.initialize()
      this.checkStatus()
    }
    script.src = 'https://js.stripe.com/v3/'
    document.body.appendChild(script)
  },
  methods: {
    // Fetches a payment intent and captures the client secret
    async initialize() {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: this.items }),
      })
      const { clientSecret } = await response.json()

      const appearance = {
        theme: 'stripe',
      }
      this.elements = this.stripe.elements({ appearance, clientSecret })

      const paymentElement = this.elements.create('payment')
      paymentElement.mount('#payment-element')
    },

    async handleSubmit(e) {
      e.preventDefault()
      this.setLoading(true)

      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: 'http://localhost:4300/market/done',
          receipt_email: document.getElementById('email').value,
        },
      })

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (error.type === 'card_error' || error.type === 'validation_error') {
        showMessage(error.message)
      } else {
        showMessage('An unexpected error occured.')
      }

      setLoading(false)
    },

    // Fetches the payment intent status after payment submission
    async checkStatus() {
      const clientSecret = new URLSearchParams(window.location.search).get(
        'payment_intent_client_secret',
      )

      if (!clientSecret) {
        return
      }

      const { paymentIntent } = await this.stripe.retrievePaymentIntent(
        clientSecret,
      )

      switch (paymentIntent.status) {
        case 'succeeded':
          showMessage('Payment succeeded!')
          break
        case 'processing':
          showMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          showMessage('Your payment was not successful, please try again.')
          break
        default:
          showMessage('Something went wrong.')
          break
      }
    },

    // ------- UI helpers -------

    showMessage(messageText) {
      const messageContainer = document.querySelector('#payment-message')

      messageContainer.classList.remove('hidden')
      messageContainer.textContent = messageText

      setTimeout(() => {
        messageContainer.classList.add('hidden')
        messageText.textContent = ''
      }, 4000)
    },

    // Show a spinner on payment submission
    setLoading(isLoading) {
      if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector('#submit').disabled = true
        document.querySelector('#spinner').classList.remove('hidden')
        document.querySelector('#button-text').classList.add('hidden')
      } else {
        document.querySelector('#submit').disabled = false
        document.querySelector('#spinner').classList.add('hidden')
        document.querySelector('#button-text').classList.remove('hidden')
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  max-width: 1000px;
}

form {
  color: var(--bg);
  width: 30vw;
  min-width: 500px;
  align-self: center;
  box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
  border-radius: 7px;
  padding: 40px;
}

.hidden {
  display: none;
}

#payment-message {
  color: rgb(105, 115, 134);
  font-size: 16px;
  line-height: 20px;
  padding-top: 12px;
  text-align: center;
}

#payment-element {
  margin-bottom: 24px;
}

/* Buttons and links */
button {
  background: #5469d4;
  font-family: Arial, sans-serif;
  color: #ffffff;
  border-radius: 4px;
  border: 0;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  transition: all 0.2s ease;
  box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
  width: 100%;
}
button:hover {
  filter: contrast(115%);
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}

/* spinner/processing state, errors */
.spinner,
.spinner:before,
.spinner:after {
  border-radius: 50%;
}
.spinner {
  color: #ffffff;
  font-size: 22px;
  text-indent: -99999px;
  margin: 0px auto;
  position: relative;
  width: 20px;
  height: 20px;
  box-shadow: inset 0 0 0 2px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.spinner:before,
.spinner:after {
  position: absolute;
  content: '';
}
.spinner:before {
  width: 10.4px;
  height: 20.4px;
  background: #5469d4;
  border-radius: 20.4px 0 0 20.4px;
  top: -0.2px;
  left: -0.2px;
  -webkit-transform-origin: 10.4px 10.2px;
  transform-origin: 10.4px 10.2px;
  -webkit-animation: loading 2s infinite ease 1.5s;
  animation: loading 2s infinite ease 1.5s;
}
.spinner:after {
  width: 10.4px;
  height: 10.2px;
  background: #5469d4;
  border-radius: 0 10.2px 10.2px 0;
  top: -0.1px;
  left: 10.2px;
  -webkit-transform-origin: 0px 10.2px;
  transform-origin: 0px 10.2px;
  -webkit-animation: loading 2s infinite ease;
  animation: loading 2s infinite ease;
}

@-webkit-keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@media only screen and (max-width: 600px) {
  form {
    width: 80vw;
    min-width: initial;
  }
}
</style>
