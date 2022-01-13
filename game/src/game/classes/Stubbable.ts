import c from '../../../../common/dist'

export class Stubbable {
  /* new profiler approach */

  constructor() {
    setTimeout(() => {
      const profiler = c.massProfiler

      if (!profiler || !profiler.enabled) return
      Object.getOwnPropertyNames(this)
        .filter((key) => typeof this[key] === `function`)
        .forEach((functionKey) => {
          const baseFunction = this[functionKey]
          if (baseFunction.constructor.name === `AsyncFunction`)
            this[functionKey] = async function (...args) {
              const s = profiler.getTime()
              const result = await baseFunction.apply(this, args)
              const time = profiler.getTime() - s
              profiler.call(this.constructor.name, functionKey, time)
              return result
            }
          else
            this[functionKey] = function (...args) {
              const s = profiler.getTime()
              const result = baseFunction.apply(this, args)
              const time = profiler.getTime() - s
              profiler.call(this.constructor.name, functionKey, time)
              return result
            }
        })
    }, 1)
  }

  _stub: any | null = null

  stubify<StubType>(
    disallowedPropNames: string[] = [],
    allowRecursionDepth: number = 8,
  ): StubType {
    if (!this._stub) {
      // c.log(
      //   `stubifying`,
      //   (this as any).name,
      //   (this as any).id,
      //   (this as any).type,
      //   (this as any).displayName,
      // )

      this._stub = c.stubify(this, disallowedPropNames, allowRecursionDepth)
    }
    return this._stub as StubType
  }
}
