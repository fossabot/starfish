conn = Mongo(`mongodb://localhost:27017/starfish-test`)

db = conn.getDB(`admin`)
db.createUser({
  user: `testuser`,
  pwd: `testpassword`,
  roles: [
    {
      role: `readWrite`,
      db: `starfish-test`,
    },
  ],
})
db = conn.getDB(`starfish-test`)
db.auth(`testuser`, `testpassword`)
printjson(db.system.users.countDocuments())
