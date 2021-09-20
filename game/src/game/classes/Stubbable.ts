import c from '../../../../common/dist'

export class Stubbable {
  _stub: any | null = null

  stubify<StubType>(
    disallowedPropNames: string[] = [],
    allowRecursion: boolean = true,
  ): StubType {
    if (!this._stub)
      this._stub = c.stubify(
        this,
        disallowedPropNames,
        allowRecursion,
      )
    return this._stub as StubType
  }
}
