// const path = require(`path`)

const dim = `\x1b[2m`,
  reset = `\x1b[0m`

const log = (...args: any[]): void => {
  // const entryPoint =
  //   path.dirname(require.main!.filename) + `/`
  // const pathName = __filename
  //   .replace(entryPoint, ``)
  //   .replace(/\.(?:ts|js)$/g, ``)
  const pathName = /log\.[jt]s[^\n]*\n[^\n]*\/([^/]+\/[^/:]+)\.[^:]+/gi.exec(
    `${new Error().stack}`,
  )?.[1]
  console.log(dim + `[` + pathName + `]` + reset, ...args)
}

export default log
