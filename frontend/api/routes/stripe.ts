import { Router } from 'express'
const router = Router()
import c from '../../../common/dist'
// This is your test secret API key.
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: `2020-08-27`,
})

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400
}

router.post(`/create-payment-intent`, async (req, res) => {
  c.log(`Creating payment intent...`)
  const { items } = req.body

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: `usd`,
    // eslint-disable-next-line
    automatic_payment_methods: {
      enabled: true,
    },
  })

  res.send({
    clientSecret: paymentIntent.client_secret,
  })
})

export default router
