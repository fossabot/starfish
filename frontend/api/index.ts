import c from '../../common/src'
import * as dotenv from 'dotenv'
dotenv.config({ path: `../.env` })

import * as sheets from './routes/sheets'
sheets.setup()

import express from 'express'
const cors = require(`cors`)
const bodyParser = require(`body-parser`)

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.post(`/feedback/`, (req, res) => {
  if (!req.body.comment) return res.send(`no`)
  sheets.addFeedback(
    req.body.name,
    req.body.email,
    req.body.comment,
    req.body.ship,
    req.body.crewMember,
  )
  res.send(`done`)
})
app.post(`/bug/`, (req, res) => {
  if (!req.body.comment) return res.send(`no`)
  sheets.addFeedback(
    req.body.name,
    req.body.email,
    req.body.comment,
    req.body.ship,
    req.body.crewMember,
    `bug`,
  )
  res.send(`done`)
})
app.post(`/story/`, (req, res) => {
  if (!req.body.comment) return res.send(`no`)
  sheets.addFeedback(
    req.body.name,
    req.body.email,
    req.body.comment,
    req.body.ship,
    req.body.crewMember,
    `story`,
  )
  res.send(`done`)
})

module.exports = app
