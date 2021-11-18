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
    exec(
      `mongosh -u testuser -p testpassword starfish-test ${host} --eval "
        use starfish-test
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
        else
          console.log(`Database initialized for testing.\n`)
        console.log(stdout)
        resolve()
      },
    )
  })
})

after(async () => {
  return new Promise((resolve) => {
    exec(
      `mongosh -u testuser -p testpassword starfish-test  ${host} --eval "
        db.dropDatabase()"`,
      undefined,
      (error, stdout, stderr) => {
        if (error) console.log(error)
        if (stderr) console.log(stderr)
        else
          console.log(`Database cleaned up after tests.\n`)
        console.log(stdout)
        resolve()
      },
    )
  })
})
