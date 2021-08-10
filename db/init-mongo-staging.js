print(`Start #################################################################`)

db = db.getSiblingDB(`starfish`)
// db.createUser({
//   user: process.env.MONGO_USERNAME,
//   pwd: process.env.MONGO_PASSWORD,
//   roles: [
//     {
//       role: `readWrite`,
//       db: `starfish`,
//     },
//   ],
// })

print(`END #################################################################`)

db.createUser({
  user: "starfish",
  pwd: "starfish321",
  roles: [
    {
      role: `readWrite`,
      db: `starfish`,
    },
  ],
})