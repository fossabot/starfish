import c from '../../common/dist'
import express from 'express'

const port = 4400

const app = express()

app.use(express.static(`../frontend/public/`))

app.listen(port, () => {
  c.log(
    `Express server listening on http://localhost:${port}`,
  )
})
