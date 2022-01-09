import c from './log'
import math from './math'

export class Profiler {
  enabled = true
  showTop = 10
  cutoff = 1
  name: string | false
  private snapshots: ProfilerSnapshot[] = []

  averages: { [key: string]: number } = {}

  readonly metric: any

  constructor(
    top = 10,
    name: string | false = false,
    enabled = true,
    cutoff = 2,
  ) {
    this.enabled = enabled
    this.showTop = top
    this.name = name
    this.cutoff = cutoff

    if (!this.enabled) return

    this.metric = Date
    try {
      this.metric = performance
    } catch (e) {
      this.metric = Date
    }

    this.currentSnapshot = {
      name: `start`,
      time: this.metric.now(),
      timeFromStart: 0,
    }
  }

  start() {
    if (!this.enabled) return

    this.currentSnapshot = {
      name: `start`,
      time: this.metric.now(),
      timeFromStart: 0,
    }
  }

  private get currentSnapshot(): ProfilerSnapshot | null {
    if (!this.snapshots.length) return null
    return this.snapshots[this.snapshots.length - 1]
  }

  private set currentSnapshot(ss: ProfilerSnapshot | null) {
    if (ss) this.snapshots.push(ss)
  }

  step(name?: string) {
    if (!this.enabled) return

    const time = this.metric.now()
    if (this.currentSnapshot) {
      this.currentSnapshot.duration =
        time - this.snapshots[this.snapshots.length - 1].time
      if (!this.averages[this.currentSnapshot.name]) {
        this.averages[this.currentSnapshot.name] = this.currentSnapshot.duration
      } else {
        this.averages[this.currentSnapshot.name] = math.lerp(
          this.averages[this.currentSnapshot.name] || 0,
          this.currentSnapshot.duration,
          0.1,
        )
      }
    }

    name = name || `${this.snapshots.length}`
    this.currentSnapshot = {
      name,
      time,
      timeFromStart: time - this.snapshots[0].time,
    }
  }

  end() {
    if (!this.enabled) return

    const time = this.metric.now()
    if (this.currentSnapshot)
      this.currentSnapshot.duration =
        time - this.snapshots[this.snapshots.length - 1].time

    const toPrint = this.snapshots
      .filter((s) => s.duration && s.duration >= this.cutoff)
      .sort(
        (a, b) => (this.averages[b.name] || 0) - (this.averages[a.name] || 0),
      )
      .slice(0, this.showTop)
    if (!toPrint.length) return

    c.log(`----- ${this.name ? String(this.name) : `profiler start`} -----`)
    toPrint.forEach((s) =>
      c.log(`${s.name}: ${math.r2(this.averages[s.name] || 0)}ms`),
    )

    this.snapshots = []
  }
}
