import c from './log'
import math from './math'

interface ProfilerSnapshot {
  name: string
  time: number
  timeFromStart: number
  duration?: number
}

export class Profiler {
  enabled = true
  showTop = 10
  cutoff = 1
  name: string | false
  private snapshots: ProfilerSnapshot[] = []

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
    if (this.currentSnapshot)
      this.currentSnapshot.duration =
        time -
        this.snapshots[this.snapshots.length - 1].time
    this.currentSnapshot = {
      name: name || `${this.snapshots.length}`,
      time,
      timeFromStart: time - this.snapshots[0].time,
    }
  }

  end() {
    if (!this.enabled) return

    const time = this.metric.now()
    if (this.currentSnapshot)
      this.currentSnapshot.duration =
        time -
        this.snapshots[this.snapshots.length - 1].time

    const toPrint = this.snapshots
      .filter(
        (ss) => ss.duration && ss.duration >= this.cutoff,
      )
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, this.showTop)
    if (!toPrint.length) return

    c.log(
      `----- ${
        this.name ? String(this.name) : `profiler start`
      } -----`,
    )
    toPrint.forEach((ss) =>
      c.log(
        `${this.name ? this.name + `/` : ``}${
          ss.name
        }: ${math.r2(ss.duration || 0)}ms`,
      ),
    )

    this.snapshots = []
  }
}
