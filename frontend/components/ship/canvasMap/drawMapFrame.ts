interface HoverableElement {
  data: any
  screenPos: CoordinatePair
}

import c from '../../../../common/src'
export default class Drawer {
  readonly flatScale = 10000

  element: HTMLCanvasElement
  elementScreenSize: CoordinatePair
  lerpSpeed: number = 0.03
  ctx: CanvasRenderingContext2D
  topLeft: CoordinatePair = [0, 0]
  width: number = 100
  height: number = 100

  targetCenter: CoordinatePair | null = null
  center: CoordinatePair | null = null
  previousCenter: CoordinatePair | null = null

  previousZoom: number | null = null
  zoom: number = 1
  targetZoom: number = 1

  drawCalls = 0

  constructor({
    element,
    elWidth,
    elHeight,
    lerpSpeed,
  }: {
    element: HTMLCanvasElement
    elWidth: number
    elHeight?: number
    lerpSpeed?: number
  }) {
    if (!elHeight) elHeight = elWidth
    this.elementScreenSize = [elWidth, elHeight]
    this.element = element
    this.ctx = element.getContext(`2d`)!
    if (lerpSpeed) this.lerpSpeed = lerpSpeed
  }

  draw({
    ship,
    center,
    zoom: passedZoom,
    visible,
    immediate = false,
    crewMemberId,
  }: {
    ship: ShipStub
    center: CoordinatePair
    zoom?: number
    visible?: {
      [key in keyof VisibleStub]?: VisibleStub[key]
    }
    immediate?: boolean
    crewMemberId?: string
  }) {
    if (!ship) return

    this.drawCalls = 0

    const profiler = new c.Profiler(
      4,
      `draw map frame`,
      false,
      0,
    )

    profiler.step(`bounds`)
    // ----- determine map bounds etc -----
    const shipLocation: CoordinatePair = [
      (ship?.location[0] || 0) * this.flatScale,
      (ship?.location[1] || 0) * this.flatScale * -1,
    ]
    if (!center) {
      center = shipLocation
    }
    this.targetCenter = [...center]
    if (!this.previousCenter)
      this.previousCenter = [...center]
    this.center = immediate
      ? this.targetCenter
      : [
          c.lerp(
            this.previousCenter[0],
            this.targetCenter[0],
            this.lerpSpeed,
          ),
          c.lerp(
            this.previousCenter[1],
            this.targetCenter[1],
            this.lerpSpeed,
          ),
        ]

    const sightRadius =
      (ship?.radii?.sight || 1) * this.flatScale

    const buffer = 0.93

    const devicePixelRatio = window.devicePixelRatio

    if (!passedZoom)
      this.targetZoom =
        (this.elementScreenSize[0] / sightRadius / 2) *
        buffer
    // perfect somehow
    else this.targetZoom = passedZoom

    if (this.previousZoom === null) this.previousZoom = 30 // this.targetZoom
    this.zoom = immediate
      ? this.targetZoom
      : c.lerp(
          this.previousZoom,
          this.targetZoom,
          this.lerpSpeed,
        )
    this.width = this.elementScreenSize[0] / this.zoom
    this.height =
      (this.elementScreenSize[1] ||
        this.elementScreenSize[0]) / this.zoom

    // c.log(this.zoom, this.width, this.height)

    profiler.step(`is in sight range`)
    // ----- planets -----
    const planetsToDraw: PlanetStub[] = (
      ship?.seenPlanets || []
    ).filter((p) => this.isPointInSightRange(p))

    // ----- ships -----
    const shipsToDraw: ShipStub[] = (
      visible?.ships || []
    ).filter((p) => this.isPointInSightRange(p))

    // ----- trails -----
    const trailsToDraw: CoordinatePair[][] = (
      visible?.trails || []
    ).filter((p) => this.isTrailInSightRange(p))

    // ----- caches -----
    const cachesToDraw: CacheStub[] = (
      visible?.caches || []
    ).filter((p) => this.isPointInSightRange(p))

    // ----- actually draw -----

    profiler.step(`zoom and position`)
    // ----- zoom and position -----
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(this.zoom, this.zoom)
    this.ctx.translate(
      this.width / 2 - this.center[0],
      this.height / 2 - this.center[1],
    )
    this.topLeft = this.getTopLeft()
    this.ctx.clearRect(
      ...this.topLeft,
      this.width,
      this.height,
    )

    // ----- bg and outline -----

    this.ctx.fillStyle = `#191919`
    this.ctx.fillRect(-999999, -999999, 9999999, 9999999)

    this.drawPoint({
      location: [...shipLocation].map(
        (l) => l / this.flatScale,
      ) as CoordinatePair,
      radius: sightRadius,
      color: `#111111`,
      opacity: 1,
    })

    this.drawPoint({
      location: [...shipLocation].map(
        (l) => l / this.flatScale,
      ) as CoordinatePair,
      labelTop: `vision`,
      labelBottom: `${c.r2(
        sightRadius / this.flatScale,
        2,
      )}AU`,
      radius: sightRadius,
      color: `#bbbbbb`,
      outline: true,
      opacity: 0.5,
    })

    if (ship.radii?.game)
      this.drawPoint({
        location: [0, 0],
        labelTop: `known universe`,
        radius: ship.radii.game * this.flatScale,
        color: `#bbbbbb`,
        outline: true,
        opacity: 0.5,
      })

    // ----- non-clipped objects -----

    // ----- distance circles -----
    let auBetweenLines = 1 / 10 ** 6
    const diameter = Math.max(this.width, this.height)
    while (auBetweenLines / diameter < 0.02)
      auBetweenLines *= 10
    while (auBetweenLines / diameter < 0.15)
      auBetweenLines *= 2

    for (let i = 1; i < 30; i++) {
      const radius = c.r2(auBetweenLines * i, 5)
      this.drawPoint({
        location: [...shipLocation].map(
          (l) => l / this.flatScale,
        ) as CoordinatePair,
        labelBottom:
          c.r2(radius / this.flatScale, 6) + `AU`,
        labelTop: this.radiusToTime(ship, radius),
        radius: radius,
        color: `#555555`,
        outline: true,
        opacity: 0.5,
        alwaysShowLabels: true,
      })
    }

    // ----- radii -----
    if (ship?.radii?.scan)
      this.drawPoint({
        location: [...shipLocation].map(
          (l) => l / this.flatScale,
        ) as CoordinatePair,
        labelTop: `scan`,
        labelBottom: `${c.r2(ship?.radii?.scan, 2)}AU`,
        radius: ship?.radii?.scan * this.flatScale,
        color: `#66ffdd`,
        outline: true,
        opacity: 0.4,
      })
    if (ship?.radii?.attack)
      this.drawPoint({
        location: [...shipLocation].map(
          (l) => l / this.flatScale,
        ) as CoordinatePair,
        labelTop: `attack`,
        labelBottom: `${c.r2(ship?.radii?.attack, 2)}AU`,
        radius: ship?.radii?.attack * this.flatScale,
        color: `#ff7733`,
        outline: true,
        opacity: 0.5,
      })
    if (ship?.radii?.broadcast)
      this.drawPoint({
        location: [...shipLocation].map(
          (l) => l / this.flatScale,
        ) as CoordinatePair,
        labelTop: `broadcast`,
        labelBottom: `${c.r2(ship?.radii?.broadcast, 2)}AU`,
        radius: ship?.radii?.broadcast * this.flatScale,
        color: `#dd88ff`,
        outline: true,
        opacity: 0.45,
      })

    // ----- planets
    profiler.step(`draw planets`)
    ;[...planetsToDraw].forEach((p) => {
      const sizeMod = Math.max(
        (p.radius / c.KM_PER_AU) * this.flatScale,
        ((p.radius / c.KM_PER_AU) *
          this.flatScale *
          2 *
          devicePixelRatio) /
          this.zoom,
      )
      this.drawPoint({
        location: [p.location[0], p.location[1] * -1],
        radius: 8 * sizeMod,
        color: p.color,
        glow: true,
      })
      this.drawPoint({
        location: [p.location[0], p.location[1] * -1],
        labelTop: p.name,
        radius: sizeMod,
        color: p.color,
      })
      this.drawPoint({
        location: [p.location[0], p.location[1] * -1],
        radius: c.ARRIVAL_THRESHOLD * this.flatScale,
        color: p.color,
        outline: `dash`,
        opacity: 0.4,
      })
    })

    // ----- main ship trail

    let prev: CoordinatePair | undefined
    const mainShipTrailPositions = [
      ...(ship?.previousLocations || []),
      ship.location,
    ]
    mainShipTrailPositions.forEach((pl, index) => {
      prev = ship.previousLocations[index - 1]
      if (!prev) return
      this.drawLine({
        start: [
          prev[0] * this.flatScale,
          prev[1] * this.flatScale * -1,
        ],
        end: [
          pl[0] * this.flatScale,
          pl[1] * this.flatScale * -1,
        ],
        color: `white`,
        width: 2,
        opacity:
          (index / (mainShipTrailPositions.length - 1)) *
          0.2,
      })
    })

    // ----- target lines -----
    if (crewMemberId) {
      const crewMember = ship?.crewMembers.find(
        (cm) => cm.id === crewMemberId,
      )
      if (
        crewMember?.targetLocation &&
        crewMember?.location === `cockpit`
      ) {
        this.drawLine({
          end: [...shipLocation],
          start: [
            crewMember.targetLocation[0] * this.flatScale,
            crewMember.targetLocation[1] *
              this.flatScale *
              -1,
          ],
          color: `white`,
          opacity: 0.8,
          dash: 10,
        })

        this.drawPoint({
          location: [
            crewMember.targetLocation[0],
            crewMember.targetLocation[1] * -1,
          ],
          radius: (1.5 / this.zoom) * devicePixelRatio,
          color: `white`,
        })
      }
    }

    if ((ship.speed || 0) > 0 && ship.velocity) {
      this.drawLine({
        start: [...shipLocation],
        end: [
          shipLocation[0] +
            ship.velocity[0] * 10000 * this.flatScale,
          shipLocation[1] +
            ship.velocity[1] * 10000 * this.flatScale * -1,
        ],
        color: `rgba(0, 255, 70, 1)`,
        opacity: Math.max(
          0.4,
          Math.min(ship.speed / 2, 0.7),
        ),
        dash: [2, ship.speed * 50 * 1000],
      })
    }

    if (ship?.targetShip) {
      let crewMember: any
      if (crewMemberId)
        crewMember = ship?.crewMembers.find(
          (cm) => cm.id === crewMemberId,
        )
      if (
        !crewMember ||
        (crewMember?.location === `weapons` &&
          ship.targetShip)
      )
        this.drawLine({
          end: [...shipLocation],
          start: [
            ship.targetShip.location[0] * this.flatScale,
            ship.targetShip.location[1] *
              this.flatScale *
              -1,
          ],
          color: `red`,
          opacity: 1,
          dash: 10,
        })
    }

    // ----- target points -----

    ;[ship.tutorial?.targetLocation]
      .filter((p) => p)
      .forEach((p) => {
        this.drawPoint({
          location: [
            p.coordinates[0],
            p.coordinates[1] * -1,
          ],
          labelTop: p.label,
          radius: p.radius
            ? p.radius / this.zoom
            : Math.min(20, 25 / this.zoom) *
              devicePixelRatio,
          color: p.color || `yellow`,
          outline: true,
        })
      })

    // ----- clipped objects -----

    profiler.step(`clip`)
    this.ctx.beginPath()
    this.ctx.arc(
      ...shipLocation,
      sightRadius,
      0,
      Math.PI * 2,
    )
    this.ctx.clip()

    // ----- zones
    ;[...(ship.visible?.zones || [])].forEach((z) => {
      this.drawPoint({
        location: [z.location[0], z.location[1] * -1],
        labelCenter: z.name,
        radius: z.radius * this.flatScale,
        color: z.color,
        outline: `dash`,
        opacity: 0.3,
      })
      this.drawPoint({
        location: [z.location[0], z.location[1] * -1],
        radius: z.radius * this.flatScale,
        color: z.color,
        opacity: 0.02,
      })
    })

    profiler.step(`draw trails`)
    // ----- trails
    ;[...trailsToDraw].forEach((t) => {
      let prevTrailPoint
      t.forEach((pl, index) => {
        prevTrailPoint = t[index - 1]
        if (!prevTrailPoint) return
        this.drawLine({
          start: [
            prevTrailPoint[0] * this.flatScale,
            prevTrailPoint[1] * this.flatScale * -1,
          ],
          end: [
            pl[0] * this.flatScale,
            pl[1] * this.flatScale * -1,
          ],
          width: 1.5,
          color: `#ffffff`,
          opacity: (index / (t.length - 1)) * 0.2,
        })
      })
    })

    // ----- attack remnants
    const now = Date.now()
    ship.visible?.attackRemnants.forEach(
      (ar: AttackRemnantStub) => {
        let grd = this.ctx.createLinearGradient(
          ar.start[0] * this.flatScale,
          ar.start[1] * this.flatScale * -1,
          ar.end[0] * this.flatScale,
          ar.end[1] * this.flatScale * -1,
        )
        grd.addColorStop(0, `yellow`)
        grd.addColorStop(1, `red`)

        this.drawLine({
          start: [
            ar.start[0] * this.flatScale,
            ar.start[1] * this.flatScale * -1,
          ],
          end: [
            ar.end[0] * this.flatScale,
            ar.end[1] * this.flatScale * -1,
          ],
          color: grd,
          opacity:
            (1 -
              (now - ar.time) / c.attackRemnantExpireTime) *
            (ar.damageTaken.miss ? 0.5 : 1),
          width: ar.damageTaken.miss ? 0.5 : 1,
        })
      },
    )

    profiler.step(`draw ships`)
    // ----- ships
    visible.ships.forEach((s) => {
      const pointsToDraw = [
        ...s.previousLocations,
        s.location,
      ]
      pointsToDraw.forEach((pl, index) => {
        let prevShipLocationPoint
        prevShipLocationPoint =
          s.previousLocations[index - 1]
        if (!prevShipLocationPoint) return
        this.drawLine({
          start: [
            prevShipLocationPoint[0] * this.flatScale,
            prevShipLocationPoint[1] * this.flatScale * -1,
          ],
          end: [
            pl[0] * this.flatScale,
            pl[1] * this.flatScale * -1,
          ],
          color: s.faction?.color,
          opacity:
            (index / (pointsToDraw.length - 1)) * 0.45,
        })
      })
    })
    ;[...shipsToDraw].forEach((s) => {
      this.drawPoint({
        location: [s.location[0], s.location[1] * -1],
        labelTop: !s.planet && s.name,
        radius: (4 / this.zoom) * devicePixelRatio,
        color: `rgba(30,30,30,.3)`,
      })
      this.drawPoint({
        location: [s.location[0], s.location[1] * -1],
        labelTop: !s.planet && s.name,
        radius: (3 / this.zoom) * devicePixelRatio,
        color: s.faction?.color,
      })
    })

    // player ship
    this.drawPoint({
      location: [ship.location[0], ship.location[1] * -1],
      labelTop: !ship.planet && ship.name,
      radius: (2.5 / this.zoom) * devicePixelRatio,
      color: `white`,
    })

    profiler.step(`draw caches`)
    // ----- caches
    ;[...cachesToDraw].forEach((k) => {
      this.drawPoint({
        location: [k.location[0], k.location[1] * -1],
        radius: (1.5 / this.zoom) * devicePixelRatio,
        color: `#dddd00`,
        opacity: 0.8,
      })
    })

    profiler.step(`reset`)
    // ----- reset for next time -----

    this.ctx.restore()
    this.previousCenter = [...this.center]
    this.previousZoom = this.zoom

    // c.log(this.drawCalls, `draw calls`)
    profiler.end()
  }

  drawPoint({
    location,
    radius = 1,
    labelTop,
    labelBottom,
    labelCenter,
    color = `pink`,
    opacity = 1,
    outline = false,
    glow = false,
    alwaysShowLabels = false,
  }: {
    location: CoordinatePair
    radius: number
    labelTop?: string | false
    opacity?: number
    labelBottom?: string | false
    labelCenter?: string | false
    color?: string
    outline?: boolean | `dash`
    glow?: boolean
    alwaysShowLabels?: boolean
  }) {
    this.drawCalls++

    this.ctx.fillStyle = color

    if (
      (labelTop || labelBottom || labelCenter) &&
      (alwaysShowLabels || this.zoom > 0.035)
    ) {
      this.ctx.globalAlpha = Math.max(0.35, opacity * 0.5)
      this.ctx.textAlign = `center`
      this.ctx.font = `bold ${(0.9 / this.zoom) *
        window.devicePixelRatio}em Source Code Pro`
      if (labelTop)
        this.ctx.fillText(
          labelTop.toUpperCase(),
          location[0] * this.flatScale,
          location[1] * this.flatScale -
            radius -
            this.width * 0.005,
        )
      if (labelBottom)
        this.ctx.fillText(
          labelBottom.toUpperCase(),
          location[0] * this.flatScale,
          location[1] * this.flatScale +
            radius +
            this.width * 0.02,
        )
      if (labelCenter)
        this.ctx.fillText(
          labelCenter.toUpperCase(),
          location[0] * this.flatScale,
          location[1] * this.flatScale + this.width * 0.01,
        )
    }

    this.ctx.globalAlpha = opacity

    this.ctx.beginPath()
    this.ctx.arc(
      location[0] * this.flatScale,
      location[1] * this.flatScale,
      radius,
      0,
      Math.PI * 2,
    )
    if (outline) {
      if (outline === `dash`)
        this.ctx.setLineDash([8 / this.zoom, 6 / this.zoom])
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = 1 / this.zoom
      this.ctx.stroke()
      if (outline === `dash`) this.ctx.setLineDash([])
    } else {
      if (glow) {
        this.ctx.globalAlpha = Math.max(0.2, opacity * 0.3)
        let grd = this.ctx.createRadialGradient(
          location[0] * this.flatScale,
          location[1] * this.flatScale,
          0,
          location[0] * this.flatScale,
          location[1] * this.flatScale,
          radius,
        )
        grd.addColorStop(0, color)
        grd.addColorStop(1, `transparent`)
        this.ctx.fillStyle = grd
      }
      this.ctx.fill()
    }

    this.ctx.globalAlpha = 1
  }

  drawLine({
    start,
    end,
    width = 1,
    color = `pink`,
    opacity = 1,
    dash = false,
  }: {
    start: CoordinatePair
    end: CoordinatePair
    width?: number
    opacity?: number
    color?: string | CanvasGradient
    dash?: false | number | CoordinatePair
  }) {
    this.drawCalls++

    this.ctx.strokeStyle = color
    this.ctx.globalAlpha = opacity
    this.ctx.lineWidth = width / this.zoom

    this.ctx.beginPath()
    this.ctx.moveTo(...start)
    this.ctx.lineTo(...end)
    if (dash)
      if (Array.isArray(dash))
        this.ctx.setLineDash(dash.map((d) => d / this.zoom))
      else
        this.ctx.setLineDash([
          dash / this.zoom,
          dash / this.zoom,
        ])
    this.ctx.strokeStyle = color
    this.ctx.stroke()
    if (dash) this.ctx.setLineDash([])

    this.ctx.globalAlpha = 1
  }

  isIdle() {
    return (
      Math.abs(this.targetZoom - (this.previousZoom || 0)) <
        0.001 &&
      Math.abs(
        (this.targetCenter?.[0] || 1) -
          (this.previousCenter?.[0] || 1),
      ) < 0.001 &&
      Math.abs(
        (this.targetCenter?.[1] || 1) -
          (this.previousCenter?.[1] || 1),
      ) < 0.001
    )
  }

  getTopLeft(): CoordinatePair {
    if (!this.center) return [0, 0]
    return [
      this.center[0] - this.width / 2,
      this.center[1] - this.height / 2,
    ]
  }

  isPointInSightRange(el: HasLocation): boolean {
    return c.pointIsInsideCircle(
      this.center
        ? [
            this.center[0] / this.flatScale,
            (this.center[1] * -1) / this.flatScale,
          ]
        : [0, 0],
      el.location,
      (this.width / this.flatScale) * 0.6,
    )
  }

  isTrailInSightRange(t: CoordinatePair[]) {
    return true
  }

  radiusToTime(ship: ShipStub, r: number) {
    if (ship.speed === 0) return
    const secondsToGetThere = Math.round(
      r / this.flatScale / ship.speed,
    )
    let remainingTime = secondsToGetThere

    let hours: any = Math.floor(remainingTime / (60 * 60))
    remainingTime -= hours * 60 * 60

    let minutes: any = Math.floor(remainingTime / 60)
    remainingTime -= minutes * 60
    if (minutes < 10 && hours > 0) minutes = `0${minutes}`

    let seconds: any = remainingTime
    if (seconds < 10) seconds = `0${seconds}`

    if (!hours) return `${minutes}m`
    return `${hours}h ${minutes}m` // ${seconds}s
  }
}