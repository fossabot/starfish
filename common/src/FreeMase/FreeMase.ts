import c from '../log'
import { Rect } from './Rect'
import misc from '../misc'

export class FreeMase {
  parentEl: HTMLElement
  maxWidth: number
  maxHeight = 99999
  window: Window

  constructor(parentEl: HTMLElement) {
    this.parentEl = parentEl
    this.maxWidth = parentEl.offsetWidth
    this.window = window
    if (!window) return

    this.window.addEventListener(
      `resize`,
      misc.debounce(() => {
        this.position()
      }),
      {
        passive: true,
      },
    )

    this.position()
  }

  async position() {
    const startTime = Date.now()
    // c.log(`resetting positions`)
    this.parentEl.setAttribute(`style`, `width: 100%;`)
    this.maxWidth = this.parentEl.offsetWidth

    let availableSpaces: Rect[] = [
      new Rect({
        top: 0,
        left: 0,
        right: this.maxWidth,
        bottom: this.maxHeight,
      }),
    ]
    const takenSpaces: Rect[] = []

    for (
      let i = 0;
      i < this.parentEl.children.length;
      i++
    ) {
      const element = this.parentEl.children[
        i
      ] as HTMLElement
      element.setAttribute(
        `style`,
        `position: absolute; top: 0; left: 0;`,
      )
    }

    const placeOneFrame = (element: HTMLElement) => {
      const elBcr = element.getBoundingClientRect()

      const firstFitIndex = availableSpaces.findIndex(
        (space) => {
          if (elBcr.width > space.width) return false
          if (elBcr.height > space.height) return false
          return true
        },
      )
      if (firstFitIndex === -1) return
      const firstFit = availableSpaces[firstFitIndex]

      element.setAttribute(
        `style`,
        `position: absolute; top:${firstFit.top}px; left: ${firstFit.left}px;`,
      )
      const placedRect: Rect = new Rect({
        top: firstFit.top,
        left: firstFit.left,
        bottom: firstFit.top + elBcr.height,
        right: firstFit.left + elBcr.width,
      })
      takenSpaces.push(placedRect)

      // c.log(`---`)
      // c.log(`placing:`, element)
      // c.log(`placing in rect`, placedRect)

      // recalculate available spaces
      availableSpaces = []

      let doneAddingNewAvailableSpaces = false
      let searchTop = 0
      const getNewSearchTop = (
        next: number,
        takenRect: Rect,
      ) => {
        if (
          takenRect.bottom < next &&
          takenRect.bottom > searchTop
        )
          return takenRect.bottom
        return next
      }

      while (!doneAddingNewAvailableSpaces) {
        let aligned: Rect[] = []
        // find all that hit one horizontal line
        for (let takenRect of takenSpaces) {
          const verticallyAligned =
            searchTop >= takenRect.top &&
            searchTop < takenRect.bottom
          if (verticallyAligned) aligned.push(takenRect)
        }

        // if nothing found, end
        if (!aligned.length) {
          doneAddingNewAvailableSpaces = true
          continue
        }

        // find the gaps
        const foundSpans: {
          left: number
          right: number
        }[] = []
        for (let takenRect of aligned) {
          // check left
          if (takenRect.left > 0) {
            const nextToTheLeft = aligned.reduce(
              (next: Rect | null, otherRect: Rect) => {
                if (otherRect === takenRect) return next
                if (
                  otherRect.right <= takenRect.left &&
                  (!next || otherRect.right > next.right)
                ) {
                  return otherRect
                }
                return next
              },
              null,
            )
            if (
              nextToTheLeft &&
              nextToTheLeft.right < takenRect.left
            ) {
              // there's a gap!
              foundSpans.push({
                left: nextToTheLeft.right,
                right: takenRect.left,
              })
            } else if (!nextToTheLeft) {
              foundSpans.push({
                left: 0,
                right: takenRect.left,
              })
            }
          }

          // check right
          const nextToTheRight = aligned.reduce(
            (next: Rect | null, otherRect: Rect) => {
              if (otherRect === takenRect) return next
              if (
                otherRect.left >= takenRect.right &&
                (!next || otherRect.left < next.left)
              ) {
                return otherRect
              }
              return next
            },
            null,
          )
          if (
            nextToTheRight &&
            nextToTheRight.left > takenRect.right
          ) {
            // there's a gap!
            foundSpans.push({
              left: takenRect.right,
              right: nextToTheRight.left,
            })
          } else if (
            !nextToTheRight &&
            takenRect.right !== this.maxWidth
          ) {
            foundSpans.push({
              left: takenRect.right,
              right: this.maxWidth,
            })
          }
        }
        // c.log(`gaps`, foundSpans)

        // get the max heights for the gaps
        for (let { left, right } of foundSpans) {
          let top = searchTop
          let bottom = this.maxHeight
          for (let takenRect of takenSpaces) {
            if (
              takenRect.left >= right ||
              takenRect.right <= left
            )
              continue
            if (takenRect.bottom <= top) continue
            if (takenRect.top < bottom)
              bottom = takenRect.top
          }
          // add the available space rect
          if (bottom !== top)
            availableSpaces.push(
              new Rect({ top, bottom, left, right }),
            )
        }

        // get new search starting horizontal line
        searchTop = aligned.reduce(
          getNewSearchTop,
          this.maxHeight,
        )
        if (searchTop === this.maxHeight)
          doneAddingNewAvailableSpaces = true
      }

      // add bottom available space
      const lastTakenSpace = takenSpaces.reduce(
        (last: Rect, curr: Rect) => {
          if (curr.bottom > last.bottom) return curr
          return last
        },
        takenSpaces[0],
      ) || { bottom: 0 }
      availableSpaces.push(
        new Rect({
          top: lastTakenSpace.bottom,
          bottom: this.maxHeight,
          left: 0,
          right: this.maxWidth,
        }),
      )

      // c.log(`available spaces:`, availableSpaces)
    }

    for (
      let i = 0;
      i < this.parentEl.children.length;
      i++
    ) {
      const element = this.parentEl.children[
        i
      ] as HTMLElement
      await new Promise<void>((resolve) => {
        // this.window.requestAnimationFrame(() => {
        placeOneFrame(element)
        resolve()
        // })
      })
      // debugger
    }

    const lastTakenSpace =
      takenSpaces.reduce((last: Rect, curr: Rect) => {
        if (curr.bottom > last.bottom) return curr
        return last
      }, takenSpaces[0])?.bottom || 0
    this.parentEl.setAttribute(
      `style`,
      `width: 100%; height: ${lastTakenSpace}px;`,
    )

    const elapsedTime = Date.now() - startTime
    // c.log(`elapsed time: ${elapsedTime}`)
  }
}
