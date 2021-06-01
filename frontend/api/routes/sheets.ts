import c from '../../../common/src'
const { GoogleSpreadsheet } = require(`google-spreadsheet`)

/* eslint-disable */
process.env.private_key = process.env.private_key.replace(
  /\\n/g,
  `\n`,
)
/* eslint-enable */

let sheet

export async function setup() {
  // c.log(`Connecting to Google Sheets...`)
  let doc = new GoogleSpreadsheet(
    `1Veb8-dr7oemyFqFKmUDsgjsYgOEqmU6lpIOeBn7fIJY`,
  )

  // authentication
  await doc.useServiceAccountAuth(process.env, (err) => {
    c.log(`Google Sheets auth error:`, err)
  })

  const timer = setTimeout(
    () =>
      c.log(
        `Google Sheets is taking longer than usual to respond. Likely error connecting...`,
      ),
    10000,
  )

  await doc.loadInfo() // loads document properties and worksheets
  clearTimeout(timer)
  c.log(`Ready to access google sheets document`, doc.title)

  sheet = doc.sheetsByIndex[0]
}

export async function addFeedback(
  name: string,
  email: string,
  comment: string,
) {
  if (!sheet)
    return setTimeout(
      () => addFeedback(name, email, comment),
      1000,
    )

  comment = decodeURIComponent(comment).replace(`;`, `,`)
  if (comment.substring(0, 1) === `=`)
    comment = comment.substring(1)
  sheet.addRow([
    new Date().toDateString(),
    name,
    email,
    comment.slice(0, 10000),
  ])
  c.log(`Added feedback in Google Sheets.`)
}
