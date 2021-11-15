import c from '../../common/src'
import { exec } from 'child_process'
import isDocker from 'is-docker'

import './Game'
import './dbSetup'
import './ioCommands'
import './AttackRemnant'
import './CrewMember'
import './Ship'
import './HumanShip'
import './Tutorial'
import './Combat'
import './AIShip'
import './Planet'
import './Admin'
import './Contracts'

const host = isDocker() ? `--host mongodb` : ``

before(async () => {
  return new Promise((resolve) => {
    exec(`mongo`)
    exec(`mongo --exec "use admin;"`)
    exec(
      `mongo ${host} --eval "
        getSiblingDB('starfish-test').createUser({
          user: 'testuser',
          pwd: 'testpassword',
          roles: [
            {
              role: 'readWrite',
              db: 'starfish',
            },
          ],
        });"`,
      undefined,
      (error, stdout, stderr) => {
        if (error) console.log(error)
        if (stderr) console.log(stderr)
        else
          console.log(`Database initialized for testing.\n`)
        resolve()
      },
    )
  })
})

after(async () => {
  if (process.env.NODE_ENV === `staging`) {
    return
  }
  return new Promise((resolve) => {
    exec(
      `mongo ${host} --eval "
        getSiblingDB('starfish-test')
          .dropUser('testuser')
          .dropDatabase()"`,
      undefined,
      (error, stdout, stderr) => {
        if (error) console.log(error)
        if (stderr) console.log(stderr)
        else console.log(`Database cleaned up after tests.`)
        resolve()
      },
    )
  })
})
