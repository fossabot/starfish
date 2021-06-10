import c from '../../../common/src'
const { GoogleSpreadsheet } = require(`google-spreadsheet`)

/* eslint-disable */
process.env.private_key = process.env.private_key.replace(
  /\\n/g,
  `\n`,
)
/* eslint-enable */

let feedbackSheet, bugsSheet, storiesSheet

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

  feedbackSheet = doc.sheetsByIndex[0]
  bugsSheet = doc.sheetsByIndex[1]
  storiesSheet = doc.sheetsByIndex[2]
}

export async function addFeedback(
  name: string,
  email: string,
  comment: string,
  ship: string = ``,
  crewMember: string = ``,
  type: `feedback` | `bug` | `story` = `feedback`,
) {
  if (!feedbackSheet)
    return setTimeout(
      () =>
        addFeedback(name, email, comment, ship, crewMember),
      1000,
    )

  comment = decodeURIComponent(comment).replace(`;`, `,`)
  if (comment.substring(0, 1) === `=`)
    comment = comment.substring(1)

  const targetSheet =
    type === `feedback`
      ? feedbackSheet
      : type === `bug`
      ? bugsSheet
      : storiesSheet

  targetSheet.addRow([
    new Date().toDateString(),
    name,
    email,
    comment.slice(0, 10000),
    ship,
    crewMember,
  ])
  c.log(`Added ${type} in Google Sheets.`)
}
