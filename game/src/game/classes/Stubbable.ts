import c from '../../../../common/dist'

export class Stubbable {
  _stub: any | null = null

  stubify<StubType>(
    disallowedPropNames: string[] = [],
    allowRecursionDepth: number = 8,
  ): StubType {
    if (!this._stub) {
      c.log(
        `stubifying`,
        (this as any).name,
        (this as any).id,
        (this as any).type,
        (this as any).displayName,
      )

      this._stub = c.stubify(
        this,
        disallowedPropNames,
        allowRecursionDepth,
      )
    }
    return this._stub as StubType
  }
}
