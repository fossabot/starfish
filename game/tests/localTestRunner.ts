import { exec } from 'child_process'

exec(
  `TS_NODE_PROJECT="tsconfig.test.json" mocha --require ts-node/register --exit 'tests/index.ts'`,
  undefined,
  (error, stdout, stderr) => {
    if (error) console.log(error)
    console.log(stdout)
  },
)
