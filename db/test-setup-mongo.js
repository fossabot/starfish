conn = Mongo()
db = conn.getDB(`starfish-test`)

printjson(db.system.users.countDocuments())
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
printjson(db.system.users.countDocuments())
