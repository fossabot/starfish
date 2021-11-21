db = db.getSiblingDB(`starfish-test`)
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
