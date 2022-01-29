import express from 'express'
import c from '../../common/dist'

const app = express()
app.use(express.json())

import discordRoutes from './routes/discord'
import stripeRoutes from './routes/stripe'

app.use(`/discord`, discordRoutes)
app.use(`/stripe`, stripeRoutes)

module.exports = app
