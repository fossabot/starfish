print(`Start #################################################################`)
db = db.getSiblingDB(`starfish`)
db.createUser({
  user: `starfish`,
  pwd: `starfish123`,
  roles: [
    {
      role: `readWrite`,
      db: `starfish`,
    },
  ],
})

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
db.createCollection(`TESTASS`)
print(`END #################################################################`)

// db.createCollection(`guilds`, {
//   capped: false,
//   validator: {
//     $jsonSchema: {
//       bsonType: `object`,
//       properties: {
//         active: { bsonType: `bool` },
//         channel: { bsonType: `string` },
//         created: { bsontype: `int` },
//         faction: { bsontype: `object` },
//         id: { bsonType: `string` },
//         name: { bsonType: `string` },
//         settings: { bsonType: `object` },
//         ship: { bsonType: `object` },

//       }
//     }
//   }
// })
// db.createCollection(`guilds`, { capped: false })
// db.createCollection(`caches`, { capped: false })
// db.createCollection(`planets`, { capped: false })

// db.guild.insert([
//   { "guild": 1, "prop": `a` },
//   { "guild": 2, "prop": `a` },
//   { "guild": 3, "prop": `b` },
//   { "guild": 4, "prop": `b` },
//   { "guild": 5 }
// ])

// db.cache.insert([
//   { "cache": 1 },
//   { "cache": 2 },
//   { "cache": 3 },
//   { "cache": 4 },
//   { "cache": 5 }
// ])
