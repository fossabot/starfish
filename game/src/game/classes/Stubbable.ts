import c from '../../../../common/dist'

export class Stubbable {
  _stub: any | null = null

  stubify<StubType>() {
    if (!this._stub) this._stub = c.stubify(this)
    return this._stub as StubType
  }
}