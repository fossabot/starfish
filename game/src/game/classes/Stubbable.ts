import c from '../../../../common/dist'

export class Stubbable {
  _stub: any | null = null

  stubify<StubType>(
    disallowedPropNames: string[] = [],
    allowRecursionDepth: number = 8,
  ): StubType {
    if (!this._stub)
      this._stub = c.stubify(
        this,
        disallowedPropNames,
        allowRecursionDepth,
      )
    return this._stub as StubType
  }
}
