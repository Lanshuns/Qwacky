import { AddressSource } from '../types'

export interface StatAddress {
  value: string
  timestamp: number
  tags?: string[]
  source?: AddressSource
}

export interface StatAlias {
  timestamp: number
}

export type StatRange = 7 | 30 | 0

export interface SeriesPoint {
  label: string
  count: number
}

export interface TagCount {
  tag: string
  count: number
}

export interface AddressStats {
  total: number
  sendTotal: number
  timelineTotal: number
  inRange: number
  inPreviousRange: number
  series: SeriesPoint[]
  tagged: number
  topTags: TagCount[]
  bySource: Record<AddressSource, number>
  firstTimestamp: number | null
}

const startOfDay = (ms: number): number => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const shiftDays = (dayStart: number, days: number): number => {
  const d = new Date(dayStart)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

const startOfMonth = (ms: number): number => {
  const d = new Date(ms)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const isTimelineAddress = (a: StatAddress) => a.source !== 'import'

const countBetween = (items: { timestamp: number }[], from: number, to: number): number =>
  items.reduce((n, item) => (item.timestamp >= from && item.timestamp < to ? n + 1 : n), 0)

const dailySeries = (items: { timestamp: number }[], days: number, now: number, locale?: string): SeriesPoint[] => {
  const today = startOfDay(now)
  const fmt = new Intl.DateTimeFormat(locale, days <= 7 ? { weekday: 'short' } : { day: 'numeric' })
  const points: SeriesPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const from = shiftDays(today, -i)
    points.push({ label: fmt.format(new Date(from)), count: countBetween(items, from, shiftDays(from, 1)) })
  }
  return points
}

const monthlySeries = (items: { timestamp: number }[], months: number, now: number, locale?: string): SeriesPoint[] => {
  const fmt = new Intl.DateTimeFormat(locale, { month: 'short' })
  const points: SeriesPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(startOfMonth(now))
    d.setMonth(d.getMonth() - i)
    const from = d.getTime()
    const next = new Date(from)
    next.setMonth(next.getMonth() + 1)
    points.push({ label: fmt.format(d), count: countBetween(items, from, next.getTime()) })
  }
  return points
}

export const computeStats = (
  addresses: StatAddress[],
  aliases: StatAlias[],
  range: StatRange,
  now: number = Date.now(),
  locale?: string
): AddressStats => {
  const timeline = addresses.filter(isTimelineAddress)
  const today = startOfDay(now)

  let inRange: number
  let inPreviousRange: number
  let series: SeriesPoint[]

  if (range === 0) {
    inRange = timeline.length
    inPreviousRange = 0
    series = monthlySeries(timeline, 12, now, locale)
  } else {
    const from = shiftDays(today, -(range - 1))
    inRange = countBetween(timeline, from, shiftDays(today, 1))
    inPreviousRange = countBetween(timeline, shiftDays(from, -range), from)
    series = dailySeries(timeline, range, now, locale)
  }

  const tagCounts = new Map<string, number>()
  let tagged = 0
  const bySource: Record<AddressSource, number> = { popup: 0, menu: 0, shortcut: 0, import: 0 }
  let firstTimestamp: number | null = null

  for (const a of addresses) {
    if (a.tags && a.tags.length > 0) {
      tagged++
      for (const t of a.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1)
    }
    bySource[a.source || 'popup']++
    if (isTimelineAddress(a) && (firstTimestamp === null || a.timestamp < firstTimestamp)) {
      firstTimestamp = a.timestamp
    }
  }

  const topTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((x, y) => y.count - x.count || x.tag.localeCompare(y.tag))
    .slice(0, 3)

  return {
    total: addresses.length,
    sendTotal: aliases.length,
    timelineTotal: timeline.length,
    inRange,
    inPreviousRange,
    series,
    tagged,
    topTags,
    bySource,
    firstTimestamp
  }
}
