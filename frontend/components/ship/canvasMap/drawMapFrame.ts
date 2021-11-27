interface HoverableElement {
  data: any
  screenPos: CoordinatePair
}

import c from '../../../../common/dist'
export default class Drawer {
  readonly flatScale = 10000
  readonly baseFontEm = 0.9

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
    if (lerpSpeed) this.lerpSpeed = lerpSpeed
  }

  draw({
    ship,
    center,
    zoom: passedZoom,
    visible,
    immediate = false,
    crewMemberId,
    targetPoints = [],
  }: // previousData,
  {
    ship?: ShipStub
    center?: CoordinatePair
    zoom?: number
    visible?:
      | {
          [key in keyof VisibleStub]?: VisibleStub[key]
        }
      | AdminVisibleData
    immediate?: boolean
    crewMemberId?: string
    targetPoints?: TargetLocation[]
    // previousData?: {
    //   ship: ShipStub
    //   visible?: {
    //     [key in keyof VisibleStub]?: VisibleStub[key]
    //   }
    // }
  }) {
    if (!visible) return
    if (
      !this.element ||
      !document.body.contains(this.element)
    )
      return
    this.ctx = this.element.getContext(`2d`)

    this.ctx.globalCompositeOperation = `source-over`

    this.drawCalls = 0

    const profiler = new c.Profiler(
      4,
      `draw map frame`,
      false,
      0,
    )
    if (!visible) visible = {}

    profiler.step(`bounds`)
    // ----- determine map bounds etc -----
    const shipLocation: CoordinatePair | undefined = ship
      ? [
          (ship?.location[0] || 0) * this.flatScale,
          (ship?.location[1] || 0) * this.flatScale * -1,
        ]
      : undefined
    if (!center) center = shipLocation || [0, 0]

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
      (ship?.radii?.sight ||
        (visible as any).gameRadius ||
        1) * this.flatScale

    const buffer = 0.91

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
      ship?.seenPlanets ||
      (visible.planets as PlanetStub[]) ||
      []
    )
      .filter((p) => p)
      .filter(
        (p) =>
          (visible as AdminVisibleData).showAll ||
          this.isPointInSightRange(p),
      )

    // ----- planets -----
    const cometsToDraw: PlanetStub[] = (
      (visible.comets as PlanetStub[]) || []
    )
      .filter((p) => p)
      .filter(
        (p) =>
          (visible as AdminVisibleData).showAll ||
          this.isPointInSightRange(p),
      )

    // ----- ships -----
    const shipsToDraw: ShipStub[] = (
      visible?.ships || []
    ).filter(
      (p) =>
        (visible as AdminVisibleData).showAll ||
        this.isPointInSightRange(p),
    )

    // ----- trails -----
    const trailsToDraw: {
      color?: string
      points: CoordinatePair[]
    }[] = ((visible as VisibleStub).trails || []).filter(
      (p) =>
        (visible as AdminVisibleData).showAll ||
        this.isTrailInSightRange(p.points),
    )

    // ----- caches -----
    const cachesToDraw: Partial<CacheStub>[] = (
      [...(visible?.caches || [])] || []
    ).filter(
      (p) =>
        (`location` in p &&
          (visible as AdminVisibleData).showAll) ||
        this.isPointInSightRange(p as HasLocation),
    )

    const zonesToDraw: Partial<ZoneStub>[] = [
      ...(visible?.zones || []),
      ...(ship?.seenLandmarks?.filter(
        (l) => l.type === `zone`,
      ) || []),
    ]

    const attackRemnantsToDraw: Partial<AttackRemnantStub>[] =
      [
        ...(visible?.attackRemnants ||
          ship?.visible?.attackRemnants ||
          []),
      ]

    // ----- target points -----
    const targetPointsToDraw: TargetLocation[] = [
      ...targetPoints,
    ]
    if (ship?.tutorial?.targetLocation)
      targetPointsToDraw.push(
        ship?.tutorial?.targetLocation,
      )

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

    this.ctx.fillStyle = `#111111`
    this.ctx.fillRect(-999999, -999999, 9999999, 9999999)

    if (shipLocation) {
      this.drawPoint({
        location: [...shipLocation].map(
          (l) => l / this.flatScale,
        ) as CoordinatePair,
        radius: sightRadius,
        color: `#0b0b0b`,
        opacity: 1,
      })

      this.drawPoint({
        location: [...shipLocation].map(
          (l) => l / this.flatScale,
        ) as CoordinatePair,
        labelTop: `vision`,
        labelBottom:
          c.speedNumber(
            sightRadius / this.flatScale,
            true,
            0,
          ) + ` km`,
        radius: sightRadius,
        color: `#bbbbbb`,
        outline: true,
        opacity: 0.5,
      })
    }

    if (
      ship?.radii?.gameSize ||
      (visible as AdminVisibleData).gameRadius
    )
      this.drawPoint({
        location: [0, 0],
        labelTop: `known universe`,
        radius:
          (ship?.radii?.gameSize ||
            (visible as AdminVisibleData).gameRadius) *
          this.flatScale,
        color: `#bbbbbb`,
        outline: true,
        opacity: 0.5,
        alwaysShowLabels: true,
      })

    if (
      ship?.radii?.safeZone ||
      (visible as AdminVisibleData).safeZoneRadius
    )
      this.drawPoint({
        location: [0, 0],
        labelTop: `protected zone`,
        radius:
          (ship?.radii?.safeZone ||
            (visible as AdminVisibleData).safeZoneRadius) *
          this.flatScale,
        color: `#00bb00`,
        outline: true,
        opacity: 0.5,
        alwaysShowLabels: true,
      })

    this.ctx.globalCompositeOperation = `lighten` // `hard-light` // `screen`

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
        location: [...(shipLocation || center)].map(
          (l) => l / this.flatScale,
        ) as CoordinatePair,
        labelBottom:
          c.speedNumber(radius / this.flatScale, true, 0) +
          ` km`,
        labelTop: ship && this.radiusToTime(ship, radius),
        radius: radius,
        color: `#555555`,
        outline: true,
        opacity: 0.5,
        alwaysShowLabels: true,
      })
    }

    if (ship && ship.radii) {
      // ----- radii -----
      if (ship.radii.scan)
        this.drawPoint({
          location: [...shipLocation].map(
            (l) => l / this.flatScale,
          ) as CoordinatePair,
          labelTop: `scan`,
          labelBottom:
            c.speedNumber(ship.radii.scan, true, 0) + ` km`,
          radius: ship.radii.scan * this.flatScale,
          color: `#66ffdd`,
          outline: true,
          opacity: 0.4,
        })
      ship.radii.attack?.forEach((ar, index) =>
        this.drawPoint({
          location: [...shipLocation].map(
            (l) => l / this.flatScale,
          ) as CoordinatePair,
          labelTop: index === 0 ? `attack` : undefined,
          labelBottom: c.speedNumber(ar, true, 0) + ` km`,
          radius: ar * this.flatScale,
          color: `#ff7733`,
          outline: true,
          opacity: 0.5,
        }),
      )
      if (ship.radii.broadcast)
        this.drawPoint({
          location: [...shipLocation].map(
            (l) => l / this.flatScale,
          ) as CoordinatePair,
          labelTop: `broadcast`,
          labelBottom:
            c.speedNumber(ship.radii.broadcast, true, 0) +
            ` km`,
          radius: ship.radii.broadcast * this.flatScale,
          color: `#dd88ff`,
          outline: true,
          opacity: 0.45,
        })
    }

    // ----- planets
    profiler.step(`draw planets`)
    ;[...planetsToDraw].forEach((p) => {
      const sizeMod = Math.max(
        (p.radius / c.kmPerAu) * this.flatScale,
        ((p.radius / c.kmPerAu) *
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
        radius:
          (ship?.gameSettings?.arrivalThreshold ||
            c.defaultGameSettings.arrivalThreshold) *
          (p.landingRadiusMultiplier || 1) *
          this.flatScale,
        color: p.color,
        outline: `dash`,
        opacity: 0.4,
      })
      if (p.defense)
        this.drawPoint({
          location: [p.location[0], p.location[1] * -1],
          radius:
            c.getPlanetDefenseRadius(p.defense) *
            this.flatScale,
          color: `#ff7733`,
          outline: `dash`,
          opacity: 0.4,
        })
    })

    if (ship) {
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
          crewMember?.location === `cockpit` &&
          !(
            crewMember?.targetObject &&
            crewMember?.targetObject?.id === ship?.id
          )
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
      if (ship?.crewMembers) {
        const crewMembers = ship?.crewMembers.filter(
          (cm) =>
            cm.targetLocation &&
            cm.location === `cockpit` &&
            cm.id !== crewMemberId &&
            !(
              cm?.targetObject &&
              cm?.targetObject?.id === ship?.id
            ),
        )
        crewMembers.forEach((cm) => {
          this.drawLine({
            end: [...shipLocation],
            start: [
              cm.targetLocation[0] * this.flatScale,
              cm.targetLocation[1] * this.flatScale * -1,
            ],
            color: `white`,
            opacity: 0.2,
            dash: 10,
          })

          this.drawPoint({
            labelTop: cm.name,
            labelScale: 0.7,
            location: [
              cm.targetLocation[0],
              cm.targetLocation[1] * -1,
            ],
            radius: (1.5 / this.zoom) * devicePixelRatio,
            color: `white`,
            opacity: 0.2,
          })
        })
      }

      // ship trajectory line
      if ((ship.speed || 0) > 0 && ship.velocity) {
        this.drawLine({
          start: [...shipLocation],
          end: [
            shipLocation[0] +
              ship.velocity[0] * 10000 * this.flatScale,
            shipLocation[1] +
              ship.velocity[1] *
                10000 *
                this.flatScale *
                -1,
          ],
          color: `rgba(0, 255, 70, 1)`,
          opacity: Math.max(
            0.4,
            Math.min(ship.speed / 2, 0.7),
          ),
          dash: [
            2,
            Math.min(
              Math.max(10, ship.speed * 50 * 1000),
              100,
            ),
          ],
        })
      }

      // attack target line
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
        ) {
          const foundShip = ship.visible?.ships.find(
            (s) => s.id === ship.targetShip.id,
          )
          if (foundShip)
            this.drawLine({
              end: [...shipLocation],
              start: [
                foundShip.location[0] * this.flatScale,
                foundShip.location[1] * this.flatScale * -1,
              ],
              color: `red`,
              opacity: 1,
              dash: 10,
            })
        }
      }
    }

    // ----- debug points -----
    if (process.env.NODE_ENV === `development`) {
      ship?.debugLocations?.forEach((loc) => {
        this.drawPoint({
          location: [loc.point[0], loc.point[1] * -1],
          labelTop: loc.label || `main debug`,
          labelScale: 0.5,
          radius: (1 / this.zoom) * devicePixelRatio,
          color: `rgb(0, 255, 100)`,
        })
      })
      shipsToDraw?.forEach((s) => {
        s.debugLocations?.forEach((loc) => {
          this.drawPoint({
            location: [loc.point[0], loc.point[1] * -1],
            labelTop: loc.label
              ? `${s.name}: ${loc.label}`
              : `${s.name} debug`,
            labelScale: 0.5,
            radius: (1 / this.zoom) * devicePixelRatio,
            color:
              c.guilds[s.guildId]?.color ||
              `rgb(0, 255, 100)`,
          })
        })
      })
    }

    // ----- target points -----

    targetPointsToDraw
      .filter((p) => p)
      .forEach((p) => {
        this.drawPoint({
          location: [p.location[0], p.location[1] * -1],
          labelTop: p.label || p.labelTop || ``,
          radius: p.radius
            ? p.radius * this.flatScale
            : (25 / this.zoom) * devicePixelRatio,
          color: p.color || `yellow`,
          outline: true,
        })
      })

    // ----- zones
    zonesToDraw
      .sort((a, b) => a.radius - b.radius)
      .forEach((z) => {
        this.drawPoint({
          location: [z.location[0], z.location[1] * -1],
          labelCenter: z.name,
          radius: z.radius * this.flatScale,
          color: z.color,
          outline: `dash`,
          opacity: 0.4,
        })
        this.drawPoint({
          location: [z.location[0], z.location[1] * -1],
          radius: z.radius * this.flatScale,
          color: z.color,
          opacity: 0.02,
        })
        if (z.effects.find((e) => e.type === `current`))
          return `hi`
        // todo
      })

    // ----- comets
    ;[...cometsToDraw].forEach((s) => {
      this.drawPoint({
        location: [s.location[0], s.location[1] * -1],
        labelTop: s.name,
        radius: (2 / this.zoom) * devicePixelRatio,
        color: s.color || `#bbb`,
      })

      this.drawPoint({
        location: [s.location[0], s.location[1] * -1],
        radius: 8 * (2 / this.zoom) * devicePixelRatio,
        color: s.color || `#bbb`,
        glow: true,
      })
      this.drawPoint({
        location: [s.location[0], s.location[1] * -1],
        radius:
          (ship?.gameSettings?.arrivalThreshold || 0.002) *
          (s.landingRadiusMultiplier || 1) *
          this.flatScale,
        color: s.color || `#bbb`,
        outline: `dash`,
        opacity: 0.4,
      })
    })

    profiler.step(`draw ships`)
    // ----- ships
    ;[...shipsToDraw].forEach((s) => {
      const angle = s.direction
        ? s.direction
        : s.velocity && s.velocity.find((v) => v)
        ? c.vectorToDegrees(s.velocity)
        : c.angleFromAToB(
            s.previousLocations[
              s.previousLocations.length - 1
            ],
            s.location,
          )
      const highlight = Boolean(
        ship?.contracts?.find(
          (co) =>
            co.status === `active` && s.id === co.targetId,
        ),
      )
      const radius =
        (c.items.chassis[s.chassis?.chassisId || `starter1`]
          .slots +
          5) /
        3
      const zoomRadius = Math.max(
        radius / this.zoom,
        ((radius * 600) / c.kmPerAu) * this.flatScale,
      )

      // shadow underneath so we can see them over homeworlds
      this.ctx.globalCompositeOperation = `source-over`
      this.drawPoint({
        location: [s.location[0], s.location[1] * -1],
        radius: zoomRadius * 1.5 * devicePixelRatio,
        color: `rgba(30,30,30,.3)`,
        triangle: angle,
      })
      this.drawPoint({
        location: [s.location[0], s.location[1] * -1],
        labelTop: !s.planet && s.name,
        radius: zoomRadius * devicePixelRatio,
        color: c.guilds[s.guildId]?.color || `#bbb`,
        triangle: angle,
      })
      this.ctx.globalCompositeOperation = `lighten`
      if (highlight)
        this.drawPoint({
          location: [s.location[0], s.location[1] * -1],
          radius: zoomRadius * 8 * devicePixelRatio,
          color: c.guilds[s.guildId]?.color || `#bbb`,
          glow: true,
        })
    })

    if (ship) {
      // player ship

      const radius =
        (c.items.chassis[
          ship.chassis?.chassisId || `starter1`
        ].slots +
          5) /
        3
      const zoomRadius = Math.max(
        radius / this.zoom,
        ((radius * 600) / c.kmPerAu) * this.flatScale,
      )

      this.drawPoint({
        location: [ship.location[0], ship.location[1] * -1],
        labelTop: !ship.planet && ship.name,
        radius: zoomRadius * devicePixelRatio,
        color: `white`,
        triangle: ship.direction
          ? ship.direction
          : ship.velocity && ship.velocity.find((v) => v)
          ? c.vectorToDegrees(ship.velocity)
          : c.angleFromAToB(
              ship.previousLocations[
                ship.previousLocations.length - 1
              ],
              ship.location,
            ),
      })
    }

    profiler.step(`draw caches`)
    // ----- caches
    ;[...cachesToDraw].forEach((k) => {
      this.drawPoint({
        location: [k.location[0], k.location[1] * -1],
        radius:
          (ship?.gameSettings?.arrivalThreshold || 0.002) *
          this.flatScale,
        color: `rgb(216, 174, 3)`, // var(--cargo)
        outline: `dash`,
        opacity: 0.4,
      })

      this.drawPoint({
        location: [k.location[0], k.location[1] * -1],
        radius: (1.5 / this.zoom) * devicePixelRatio,
        color: `rgb(216, 174, 3)`,
        opacity: 0.8,
      })
    })

    // ----- contracts
    ship?.contracts
      ?.filter(
        (co) =>
          co.status === `active` &&
          !ship.visible?.ships.find(
            (s) => s.id === co.targetId,
          ),
      )
      .forEach((co) => {
        this.drawPoint({
          location: [
            co.lastSeenLocation[0],
            co.lastSeenLocation[1] * -1,
          ],
          labelCenter: co.targetName,
          radius:
            ship.gameSettings.contractLocationRadius *
            this.flatScale,
          color: co.targetGuildId
            ? c.guilds[co.targetGuildId].color
            : `#bb0`,
          opacity: 0.4,
          outline: true,
        })
        this.drawPoint({
          location: [
            co.lastSeenLocation[0],
            co.lastSeenLocation[1] * -1,
          ],
          radius:
            ship.gameSettings.contractLocationRadius *
            this.flatScale,
          color: co.targetGuildId
            ? c.guilds[co.targetGuildId].color
            : `#bb0`,
          opacity: 0.02,
        })
      })

    // ----- clipped objects -----

    if (ship) {
      profiler.step(`clip`)
      this.ctx.beginPath()
      this.ctx.arc(
        ...shipLocation,
        sightRadius,
        0,
        Math.PI * 2,
      )
      this.ctx.clip()
    }

    profiler.step(`draw trails`)
    // ----- trails
    visible.ships?.forEach((s) => {
      const pointsToDraw = [
        ...(Array.isArray(s.previousLocations)
          ? s.previousLocations
          : []),
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
          color: c.guilds[s.guildId]?.color || `#bbb`,
          opacity:
            (index / (pointsToDraw.length - 1)) * 0.45,
        })
      })
    })
    visible.comets?.forEach((s: PlanetStub) => {
      const pointsToDraw = [
        ...(Array.isArray(s.trail) ? s.trail : []),
        s.location,
      ]
      pointsToDraw.forEach((pl, index) => {
        let prevLocationPoint
        prevLocationPoint = s.trail[index - 1]
        if (!prevLocationPoint) return
        this.drawLine({
          start: [
            prevLocationPoint[0] * this.flatScale,
            prevLocationPoint[1] * this.flatScale * -1,
          ],
          end: [
            pl[0] * this.flatScale,
            pl[1] * this.flatScale * -1,
          ],
          color: s.color || `#bbb`,
          opacity:
            (index / (pointsToDraw.length - 1)) * 0.45,
        })
      })
    })
    ;[...trailsToDraw].forEach((t) => {
      let prevTrailPoint
      t.points.forEach((pl, index) => {
        prevTrailPoint = t.points[index - 1]
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
          color: t.color || `#ffffff`,
          opacity:
            (index / (t.points.length - 1)) *
            (t.color ? 0.45 : 0.2),
        })
      })
    })

    // ----- attack remnants
    const now = Date.now()
    attackRemnantsToDraw.forEach(
      (ar: AttackRemnantStub) => {
        let grd = this.ctx.createLinearGradient(
          ar.start[0] * this.flatScale,
          ar.start[1] * this.flatScale * -1,
          ar.end[0] * this.flatScale,
          ar.end[1] * this.flatScale * -1,
        )
        grd.addColorStop(0, `rgba(255, 130, 0, 1)`)
        grd.addColorStop(
          1,
          ar.damageTaken.damageTaken
            ? `rgba(255, 200, 0, .3)`
            : `rgba(255, 200, 0, 0)`,
        )

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
            (ar.damageTaken.damageTaken > 0 ? 1 : 0.4),
          width: ar.damageTaken.damageTaken > 0 ? 1 : 0.4,
        })
      },
    )

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
    labelScale = 1,
    color = `pink`,
    opacity = 1,
    outline = false,
    glow = false,
    alwaysShowLabels = false,
    triangle,
  }: // previousData = undefined,
  {
    location: CoordinatePair
    radius: number
    opacity?: number
    labelTop?: string | false
    labelBottom?: string | false
    labelCenter?: string | false
    labelScale?: number
    color?: string
    outline?: boolean | `dash`
    glow?: boolean
    alwaysShowLabels?: boolean
    triangle?: number // angle
    // previousData?: {
    //   radius?: number
    //   location?: CoordinatePair
    // }
  }) {
    this.drawCalls++

    // if (previousData?.location)
    //   location = [
    //     c.lerp(
    //       previousData.location[0],
    //       location[0],
    //       this.lerpSpeed,
    //     ),
    //     c.lerp(
    //       previousData.location[1],
    //       location[1],
    //       this.lerpSpeed,
    //     ),
    //   ]

    // if (previousData?.radius) {
    //   c.log(radius, previousData?.radius)
    //   radius = c.lerp(
    //     previousData.radius,
    //     radius,
    //     this.lerpSpeed,
    //   )
    // }

    /* eslint-disable max-depth */
    if (
      (labelTop || labelBottom || labelCenter) &&
      (alwaysShowLabels ||
        (this.zoom > 0.035 &&
          (!outline || radius > this.width / 10)))
    ) {
      this.ctx.globalAlpha = Math.max(
        labelScale ? 0.15 : 0.35,
        opacity * 0.5,
      )

      this.ctx.font = `bold ${
        ((this.baseFontEm * labelScale) / this.zoom) *
        window.devicePixelRatio
      }em Prompt`
      const drawLabel = (
        label: string,
        position: `top` | `bottom` | `center`,
      ) => {
        const labelInMotionRadius =
          radius + this.width * 0.015
        this.ctx.fillStyle = color
        this.ctx.textAlign = `center`
        this.ctx.textBaseline =
          position === `top`
            ? `bottom`
            : position === `bottom`
            ? `top`
            : `middle`

        let targetLocation: CoordinatePair =
          position === `center`
            ? [
                location[0] * this.flatScale,
                location[1] * this.flatScale,
              ]
            : position === `top`
            ? [
                location[0] * this.flatScale,
                location[1] * this.flatScale -
                  radius -
                  this.width * 0.003,
              ]
            : [
                location[0] * this.flatScale,
                location[1] * this.flatScale +
                  radius +
                  this.width * 0.007,
              ]

        if (outline) {
          let needToMoveDown =
            this.topLeft[1] +
            this.height * 0.03 -
            targetLocation[1]

          let needToMoveUp =
            targetLocation[1] -
            (this.height +
              this.topLeft[1] -
              this.height * 0.02)

          const elementPositionInRelationToCenterAsPercent =
            [
              (this.center[0] -
                location[0] * this.flatScale) /
                this.width,
              (this.center[1] -
                location[1] * this.flatScale) /
                this.height,
            ]

          const calculatePosition = () => {
            if (needToMoveDown > 0 || needToMoveUp > 0) {
              if (position !== `center`) {
                // drawing outside the outline

                if (
                  elementPositionInRelationToCenterAsPercent[0] >=
                  0
                )
                  this.ctx.textAlign = `left`
                else this.ctx.textAlign = `right`

                const willMoveDown = needToMoveDown > 0,
                  willMoveUp = needToMoveUp > 0
                if (willMoveDown || willMoveUp) {
                  this.ctx.textBaseline = `middle`

                  const willMoveRight =
                    elementPositionInRelationToCenterAsPercent[0] >=
                    0
                  let angle, y

                  let count = 0
                  while (
                    count < 100 &&
                    (!y ||
                      (willMoveDown
                        ? y < this.topLeft[1]
                        : y >
                          this.topLeft[1] +
                            this.height -
                            this.height * 0.1))
                  ) {
                    count++
                    angle =
                      Math.PI / 2 -
                      Math.acos(
                        (labelInMotionRadius -
                          (willMoveDown
                            ? needToMoveDown
                            : needToMoveUp)) /
                          labelInMotionRadius,
                      ) +
                      Math.PI / 2
                    if (!angle) continue
                    y =
                      location[1] * this.flatScale +
                      labelInMotionRadius * Math.cos(angle)
                    if (willMoveUp)
                      y =
                        location[1] * this.flatScale +
                        (location[1] * this.flatScale - y)

                    if (!angle || isNaN(angle)) return
                  }

                  // * angle goes down from pi to 0

                  // * fade as it approaches center point
                  // this.ctx.globalAlpha =
                  //   (Math.max(0.35, opacity * 0.5) *
                  //     (angle - Math.PI / 2)) /
                  //     (Math.PI / 2)

                  let x =
                    location[0] * this.flatScale +
                    labelInMotionRadius * Math.sin(angle)

                  x = willMoveRight
                    ? x
                    : location[0] * this.flatScale +
                      (location[0] * this.flatScale - x)
                  // if (label === `vision`)
                  //   c.log({
                  //     angle,
                  //     count,
                  //   })

                  targetLocation = [x, y]
                }
              }
            }
          }
          calculatePosition()

          let needToMoveRight =
            this.topLeft[0] -
            location[0] * this.flatScale +
            this.width * 0.01

          let needToMoveLeft =
            location[0] * this.flatScale -
            (this.width +
              this.topLeft[0] -
              this.width * 0.01)

          if (needToMoveRight > 0 || needToMoveLeft > 0) {
            let distanceToMoveUpOrDown =
              labelInMotionRadius -
              Math.sqrt(
                labelInMotionRadius ** 2 -
                  Math.max(
                    needToMoveLeft,
                    needToMoveRight,
                  ) **
                    2,
              )
            if (distanceToMoveUpOrDown < 0)
              distanceToMoveUpOrDown =
                labelInMotionRadius -
                Math.abs(distanceToMoveUpOrDown)
            if (
              position === `top` &&
              needToMoveDown < distanceToMoveUpOrDown
            )
              needToMoveDown = distanceToMoveUpOrDown
            else if (
              position === `bottom` &&
              needToMoveUp < distanceToMoveUpOrDown
            )
              needToMoveUp = distanceToMoveUpOrDown

            calculatePosition()
          }
        }

        this.ctx.fillText(
          label.toUpperCase(),
          ...targetLocation,
        )

        // * tracking dot
        // this.ctx.fillStyle = `red`
        // this.ctx.beginPath()
        // this.ctx.arc(...targetLocation, 5, 0, Math.PI * 2)
        // this.ctx.fill()
      }

      if (labelTop) drawLabel(labelTop, `top`)
      if (labelBottom) drawLabel(labelBottom, `bottom`)
      if (labelCenter) drawLabel(labelCenter, `center`)
    }

    this.ctx.globalAlpha = opacity
    this.ctx.fillStyle = color

    this.ctx.beginPath()
    if (triangle === undefined) {
      this.ctx.arc(
        location[0] * this.flatScale,
        location[1] * this.flatScale,
        radius,
        0,
        Math.PI * 2,
      )
    } else {
      const trianglePoints: CoordinatePair[] = []
      const angleVector1 = c.degreesToUnitVector(triangle)
      trianglePoints.push(
        location.map(
          (l, index) =>
            l * this.flatScale +
            angleVector1[index] *
              radius *
              (index === 0 ? 1 : -1),
        ) as CoordinatePair,
      )
      const angleVector2 = c.degreesToUnitVector(
        (triangle + 135) % 360,
      )
      trianglePoints.push(
        location.map(
          (l, index) =>
            l * this.flatScale +
            angleVector2[index] *
              radius *
              (index === 0 ? 1 : -1),
        ) as CoordinatePair,
      )
      const angleVector3 = c.degreesToUnitVector(
        (triangle - 135 + 360) % 360,
      )
      trianglePoints.push(
        location.map(
          (l, index) =>
            l * this.flatScale +
            angleVector3[index] *
              radius *
              (index === 0 ? 1 : -1),
        ) as CoordinatePair,
      )

      this.ctx.moveTo(
        trianglePoints[0][0],
        trianglePoints[0][1],
      )
      this.ctx.lineTo(
        trianglePoints[1][0],
        trianglePoints[1][1],
      )
      this.ctx.lineTo(
        trianglePoints[2][0],
        trianglePoints[2][1],
      )
    }
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
    // return false
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
      (this.width / this.flatScale) * 1.5,
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
    if (secondsToGetThere > 100000000) return

    return c.msToTimeString(secondsToGetThere * 1000)
  }
}
