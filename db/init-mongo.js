print(`Start #################################################################`)

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

print(`END #################################################################`)