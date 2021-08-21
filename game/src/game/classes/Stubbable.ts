import c from '../../../../common/dist'

export class Stubbable {
  _stub: any | null = null

  stubify<StubType>(
    disallowedPropNames: string[] = [],
    disallowRecursion: boolean = false,
  ): StubType {
    if (!this._stub)
      this._stub = c.stubify(
        this,
        disallowedPropNames,
        disallowRecursion,
      )
    return this._stub as StubType
  }
}
