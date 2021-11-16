import { CrewMember } from '../CrewMember'

// ----- cosmetics -----
export function addTagline(
  this: CrewMember,
  tagline: string,
) {
  if (this.availableTaglines.find((t) => t === tagline))
    return
  this.availableTaglines.push(tagline)
  this.toUpdate.availableTaglines = this.availableTaglines
}

export function addBackground(
  this: CrewMember,
  bg: CrewBackground,
) {
  if (
    this.availableBackgrounds.find((b) => b.url === bg.url)
  )
    return
  this.availableBackgrounds.push(bg)
  this.toUpdate.availableBackgrounds =
    this.availableBackgrounds
}
