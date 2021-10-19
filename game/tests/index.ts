import { exec } from 'child_process'

import './Game'
import './dbSetup'
import './CrewMember'
import './HumanShip'
import './Tutorial'
import './ioCommands'

before(async () => {
  return new Promise((resolve) => {
    exec(
      `mongo --eval "
        db = db.getSiblingDB('starfish-test')
        db.createUser({
          user: 'testuser',
          pwd: 'testpassword',
          roles: [
            {
              role: 'readWrite',
              db: 'starfish-test',
            },
          ],
        })"`,
      undefined,
      (error, stdout, stderr) => {
        if (error) console.log(error)
        if (stderr) console.log(stderr)
        console.log(stdout) // `Database initialized for testing.\n`)
        resolve()
      },
    )
  })
})

after(async () => {
  return new Promise((resolve) => {
    exec(
      `mongo --eval "
        db = db.getSiblingDB('starfish-test')
        db.dropUser('testuser')
        db.dropDatabase()"`,
      undefined,
      (error, stdout, stderr) => {
        if (error) console.log(error)
        if (stderr) console.log(stderr)
        console.log(stdout) // `Database cleaned up after tests.`)
        resolve()
      },
    )
  })
})
