print(
  `Start #################################################################`,
)

const fs = require(`fs`)
try {
  const rootUser = fs.readFileSync(
    `/run/secrets/mongodb_root_user`,
    `utf-8`,
  )
  const rootPass = fs.readFileSync(
    `/run/secrets/mongodb_root_pass`,
    `utf-8`,
  )
  const user = fs.readFileSync(
    `/run/secrets/mongodb_user`,
    `utf-8`,
  )
  const pass = fs.readFileSync(
    `/run/secrets/mongodb_pass`,
    `utf-8`,
  )
  console.log({ rootUser, rootPass, user, pass })
} catch (e) {
  console.log(
    `failed to load secrets (if local, this is fine)`,
  )
}

db = db.getSiblingDB(`starfish-test`)
db.createUser({
  user: `testuser`,
  pwd: `testpass`,
  roles: [
    {
      role: `readWrite`,
      db: `starfish-test`,
    },
  ],
})
db.createCollection(`TESTCOLLECTION`)

print(
  `END #################################################################`,
)
