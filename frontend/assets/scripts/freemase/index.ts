import { FreeMaseRect as Rect } from './Rect'

interface FreeMaseOptions {
  centerX?: boolean
  skipLessThanHeight?: number
  debug?: boolean
}

interface FramePlacementData {
  element: HTMLElement
  rect: Rect
}

export default class FreeMase {
  parentEl: HTMLElement
  maxWidth: number = 99999
  maxHeight = 99999
  window: Window
  options: FreeMaseOptions = {}

  private resizeObserver: ResizeObserver | null = null
  private mutationObserver: MutationObserver | null = null
  private watchingForResize: Set<Element> = new Set()

  constructor(
    parentEl: HTMLElement,
    options?: FreeMaseOptions,
  ) {
    this.parentEl = parentEl
    this.window = window
    this.options = options

    if (!this.parentEl) {
      console.error(
        `FreeMase requires a parent element as the first property to its constructor.`,
      )
      return
    }
    if (!window) {
      if (this.options.debug)
        console.error(
          `FreeMase can only run in a browser (window object not found).`,
        )
      return
    }

    this.window.addEventListener(
      `resize`,
      debounce(() => {
        this.position()
      }),
      {
        passive: true,
      },
    )

    this.setup()
  }

  private async setup() {
    const giveUpLimit = 100
    let giveUp = 0
    while (!this.parentEl || !this.window) {
      await sleep(100)
      if (++giveUp > giveUpLimit) {
        if (this.options.debug)
          console.error(`FreeMase:`, `Failed to initialize`)
        return
      }
    }

    if (this.resizeObserver && this.mutationObserver) return

    this.maxWidth = this.parentEl.offsetWidth

    let ready = false
    const mutateCallback = debounce(
      (els?: MutationRecord[]) => {
        if (!ready) return
        if (els)
          els.forEach((entry) => {
            const parentEl = entry.target as Element
            if (!parentEl) return
            if (this.options.debug)
              console.log(
                `FreeMase:`,
                `base element mutated`,
              )

            this.resizeObserver.disconnect()

            // console.log(this.watchingForResize)
            // for (let el of this.watchingForResize) {
            //   console.log(el, parentEl.contains(el))
            //   if (!parentEl.contains(el)) {
            //     console.log(
            //       `FreeMase:`,
            //       `removing resize observer for`,
            //       el,
            //     )
            //     this.watchingForResize.delete(el)
            //   }
            // }

            // if (this.options.debug)
            //   console.log(
            //     `FreeMase:`,
            //     entry,
            //     entry.target.childNodes,
            //     [...entry.target.childNodes].filter(
            //       (n) => n.nodeType === 1,
            //     ),
            //     [...entry.target.childNodes].filter(
            //       (n) =>
            //         n.nodeType === 1 &&
            //         !this.watchingForResize.has(n),
            //     ),
            //     this.watchingForResize,
            //   )

            // handle initial elements
            for (let el of [
              ...entry.target.childNodes,
            ].filter(
              (n) => n.nodeType === 1,
            ) as Element[]) {
              if (this.resizeObserver)
                this.resizeObserver.observe(el)
              // if (this.options.debug)
              //   console.log(
              //     `FreeMase:`,
              //     `now watching for resize (initial):`,
              //     el,
              //   )
              this.watchingForResize.add(el)
            }

            // // handle added elements
            // for (let addedElement of [
            //   ...entry.addedNodes,
            // ].filter(
            //   (n) => n.nodeType === 1,
            // ) as Element[]) {
            //   if (this.resizeObserver)
            //     this.resizeObserver.observe(addedElement)
            //   if (this.options.debug)
            //     console.log(
            //       `FreeMase:`,
            //       `now watching for resize (added):`,
            //       addedElement,
            //     )
            // }

            // // handle removed elements
            // for (let removedElement of [
            //   ...entry.removedNodes,
            // ].filter(
            //   (n) => n.nodeType === 1,
            // ) as Element[]) {
            //   if (this.resizeObserver)
            //     this.resizeObserver.unobserve(
            //       removedElement,
            //     )
            //   if (this.options.debug)
            //     console.log(
            //       `FreeMase:`,
            //       `stopped watching for resize:`,
            //       removedElement,
            //     )
            // }
          })
        this.position()
      },
      100,
    )

    const resizeCallback = debounce(
      (els?: ResizeObserverEntry[]) => {
        if (!ready) return
        this.position()
        if (this.options.debug)
          console.log(
            `FreeMase:`,
            `resized`,
            els,
            this.watchingForResize.size,
          )
      },
      100,
    )

    this.mutationObserver = new MutationObserver(
      mutateCallback,
    )
    this.mutationObserver.observe(this.parentEl, {
      childList: true,
    })

    this.resizeObserver = new ResizeObserver(resizeCallback)
    for (let child of Array.from(this.parentEl.children)) {
      if (this.options.debug)
        console.log(
          `FreeMase:`,
          `now watching for resize (start):`,
          child,
        )
      this.resizeObserver.observe(child)
      this.watchingForResize.add(child)
    }
    ready = true
    this.position()
  }

  async position(): Promise<number> {
    if (
      !this.parentEl ||
      !this.resizeObserver ||
      !this.mutationObserver
    )
      return 0

    if (this.options.debug)
      console.log(`FreeMase:`, `positioning`)

    const startTime = Date.now()
    // console.log('FreeMase:', `resetting positions`)
    this.parentEl.style.width = `100%`
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
      element.style.position = `absolute`
      element.style.top = `0px`
      element.style.left = `${
        this.options.centerX
          ? this.maxWidth / 2 - element.offsetWidth / 2
          : 0
      }px`
    }

    const determinePlacementForOneFrame = (
      element: HTMLElement,
    ): FramePlacementData | null => {
      const elBcr = element.getBoundingClientRect()

      // const firstFitIndex = availableSpaces.findIndex(
      //   (space) => {
      //     if (elBcr.width > space.width) return false
      //     if (elBcr.height > space.height) return false
      //     return true
      //   },
      // )
      const bestFitIndex = availableSpaces.findIndex(
        (space, index) => {
          if (elBcr.width > space.width) return false
          if (elBcr.height > space.height) return false
          for (
            let i = index + 1;
            i <
            Math.min(index + 10, availableSpaces.length);
            i++
          ) {
            const nextSpace = availableSpaces[i]
            if (!nextSpace) continue

            if (
              nextSpace.left <= space.left &&
              nextSpace.width >= elBcr.width &&
              nextSpace.top - space.top <
                this.options.skipLessThanHeight
            ) {
              if (
                availableSpaces[index - 1] &&
                availableSpaces[index - 1].top === space.top
              )
                return true
              return false
            }
          }
          return true
        },
      )
      if (bestFitIndex === -1) return null
      const firstFit = availableSpaces[bestFitIndex]

      const placedRect: Rect = new Rect({
        top: firstFit.top,
        left: firstFit.left,
        bottom: firstFit.top + elBcr.height,
        right: firstFit.left + elBcr.width,
      })
      takenSpaces.push(placedRect)

      // console.log('FreeMase:', `---`)
      // console.log('FreeMase:', `placing:`, element)
      // console.log('FreeMase:', `placing in rect`, placedRect)

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
        // raycast horizontally: find all rects that hit one horizontal line
        for (let takenRect of takenSpaces) {
          const verticallyAligned =
            searchTop >= takenRect.top &&
            searchTop < takenRect.bottom
          if (verticallyAligned) aligned.push(takenRect)
        }

        // if nothing found, skip to next horizontal line
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
                )
                  return otherRect

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
        // console.log('FreeMase:', `gaps`, foundSpans)

        // get the max heights for the gaps
        for (let { left, right } of foundSpans) {
          let top = searchTop
          let bottom = this.maxHeight
          let rectBelow: Rect | undefined
          for (let takenRect of takenSpaces) {
            if (
              takenRect.left >= right ||
              takenRect.right <= left
            )
              continue
            if (takenRect.bottom <= top) continue
            if (takenRect.top < bottom) {
              bottom = takenRect.top
              rectBelow = takenRect
            }
          }
          // add the available space rect
          if (bottom !== top)
            availableSpaces.push(
              new Rect({ top, bottom, left, right }),
            )

          // if we hit another box, there's a chance that we can find more gaps
          while (rectBelow) {
            // check from the right edge of the previously hit lower box
            const newLeft = rectBelow.right
            let newBottom = this.maxHeight

            rectBelow = undefined

            // if the right edge of the lower box is beyond our rightmost limit, we're already done
            if (newLeft > right) continue

            for (let takenRect of takenSpaces) {
              if (
                takenRect.left >= right ||
                takenRect.right <= newLeft
              )
                continue
              if (takenRect.bottom <= top) continue
              if (takenRect.top < newBottom) {
                newBottom = takenRect.top
                rectBelow = takenRect
              }
            }
            // add the new available space we've found
            if (newBottom !== top) {
              availableSpaces.push(
                new Rect({
                  top,
                  bottom: newBottom,
                  left: newLeft,
                  right,
                }),
              )
            }
          }
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

      return {
        element,
        rect: placedRect,
      }

      // console.log('FreeMase:', `available spaces:`, availableSpaces)
    }

    const frames: FramePlacementData[] = []

    for (
      let i = 0;
      i < this.parentEl.children.length;
      i++
    ) {
      const element = this.parentEl.children[
        i
      ] as HTMLElement
      await new Promise<void>((resolve) => {
        const placement =
          determinePlacementForOneFrame(element)
        if (placement) frames.push(placement)

        resolve()
      })
    }

    const lastTakenSpace =
      takenSpaces.reduce((last: Rect, curr: Rect) => {
        if (curr.bottom > last.bottom) return curr
        return last
      }, takenSpaces[0])?.bottom || 0

    this.parentEl.style.height = `${lastTakenSpace}px`

    const placeFrames = (
      frameData: FramePlacementData[],
    ) => {
      let offsetLeft = 0
      if (this.options.centerX) {
        const farthestRight = frameData.reduce(
          (farthest, curr) => {
            if (curr.rect.right > farthest)
              return curr.rect.right
            return farthest
          },
          0,
        )
        offsetLeft = (this.maxWidth - farthestRight) / 2
      }
      for (let d of frameData) {
        d.element.style.top = `${d.rect.top}px`
        d.element.style.left = `${
          d.rect.left + offsetLeft
        }px`
        d.element.style.opacity = `1`
      }
    }

    placeFrames(frames)

    if (this.options.debug) {
      let debugContainer =
        document.getElementById(`freemaseDebug`)
      if (!debugContainer) {
        debugContainer = document.createElement(`div`)
        debugContainer.id = `freemaseDebug`
        debugContainer.style.position = `absolute`
        debugContainer.style.top = `0`
        debugContainer.style.left = `0`
        debugContainer.style.height = lastTakenSpace + `px`
        debugContainer.style.zIndex = `999999`
        debugContainer.style.pointerEvents = `none`
        this.parentEl.prepend(debugContainer)
      } else {
        // clear existing elements
        while (debugContainer.firstChild)
          debugContainer.removeChild(
            debugContainer.firstChild,
          )
      }
      for (let space of availableSpaces) {
        const debugEl = document.createElement(`div`)
        debugEl.style.cssText = `
          position: absolute;
          top: ${space.top}px;
          left: ${space.left}px;
          width: ${space.width}px;
          height: ${space.height}px;
          background: rgba(255, 0, 0, 0.2);
        `
        debugContainer.appendChild(debugEl)
      }

      Array.from(this.watchingForResize).forEach((el) => {
        if ((el as HTMLElement).style)
          (
            el as HTMLElement
          ).style.border = `1px solid green`
      })
    }

    const elapsedTime = Date.now() - startTime
    if (this.options.debug)
      console.log(
        `FreeMase:`,
        `elapsed time: ${elapsedTime}`,
      )

    return elapsedTime
  }
}

function debounce(fn: Function, time = 500) {
  let timeout: any
  return (...params: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...params)
    }, time)
  }
}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
