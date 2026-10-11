import React, { useEffect, useMemo, useState } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { computeStats, StatAddress, StatAlias, StatRange } from '../utils/stats'
import {
  Card,
  CardLabel,
  LatestRow,
  LatestValue,
  LatestMeta,
  EmptyHint,
  Headline,
  HeadlineNumber,
  HeadlineText,
  RangeRow,
  RangeGroup,
  RangeButton,
  RangeSummary,
  Delta,
  Bars,
  Bar,
  BarLabels,
  Grid,
  Cell,
  CellValue,
  CellLabel,
  TagRow,
  TagPill
} from '../styles/HomeStats.styles'

interface HomeStatsProps {
  addresses: StatAddress[]
  aliases: StatAlias[]
  accountTotal?: number
  copyToClipboard: (text: string, event?: MouseEvent) => void
  formatTime: (timestamp: number) => string
  showStats?: boolean
  showLatest?: boolean
}

const RANGES: Array<{ value: StatRange; label: string }> = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 0, label: 'All' }
]

const rangeNoun = (range: StatRange) => (range === 7 ? 'this week' : 'last 30 days')

const previousNoun = (range: StatRange) => (range === 7 ? 'vs week before' : 'vs 30 days before')

const sinceLabel = (timestamp: number | null) =>
  timestamp === null ? 'so far' : `since ${new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(timestamp))}`

export const HomeStats: React.FC<HomeStatsProps> = ({ addresses, aliases, accountTotal, copyToClipboard, formatTime, showStats = true, showLatest = true }) => {
  const [range, setRange] = useState<StatRange>(7)

  useEffect(() => {
    chrome.storage.local.get('statsRange', (result) => {
      if (result.statsRange === 7 || result.statsRange === 30 || result.statsRange === 0) {
        setRange(result.statsRange)
      }
    })
  }, [])

  const changeRange = (next: StatRange) => {
    setRange(next)
    chrome.storage.local.set({ statsRange: next })
  }

  const stats = useMemo(() => computeStats(addresses, aliases, range), [addresses, aliases, range])

  const latest = useMemo(() => {
    const pick = (list: StatAddress[]) =>
      list.reduce<StatAddress | null>((best, a) => (!best || a.timestamp > best.timestamp ? a : best), null)
    return pick(addresses.filter(a => a.source !== 'import')) || pick(addresses)
  }, [addresses])

  const max = Math.max(1, ...stats.series.map(p => p.count))
  const dense = stats.series.length > 12
  const delta = stats.inRange - stats.inPreviousRange
  const tone = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const fromPage = stats.bySource.menu + stats.bySource.shortcut
  const taggedPercent = stats.total > 0 ? Math.round((stats.tagged / stats.total) * 100) : 0

  return (
    <>
      {showLatest && (
      <Card aria-label="Latest address">
        <CardLabel>Latest</CardLabel>
        {latest ? (
          <LatestRow
            onClick={(e) => copyToClipboard(`${latest.value}@duck.com`, e.nativeEvent)}
            aria-label={`Copy ${latest.value}@duck.com`}
            title="Copy to clipboard"
          >
            <div>
              <LatestValue>{latest.value}@duck.com</LatestValue>
              <LatestMeta>{formatTime(latest.timestamp)}</LatestMeta>
            </div>
            <MdContentCopy size={16} />
          </LatestRow>
        ) : (
          <EmptyHint>Your first address will show up here.</EmptyHint>
        )}
      </Card>
      )}

      {showStats && (
      <Card aria-label="Statistics">
        <Headline>
          <HeadlineNumber>{stats.total}</HeadlineNumber>
          <HeadlineText>
            {stats.total === 1 ? 'site never got' : 'sites never got'} your real email
          </HeadlineText>
        </Headline>

        <RangeRow>
          <RangeGroup role="group" aria-label="Range">
            {RANGES.map(r => (
              <RangeButton
                key={r.label}
                active={range === r.value}
                aria-pressed={range === r.value}
                onClick={() => changeRange(r.value)}
              >
                {r.label}
              </RangeButton>
            ))}
          </RangeGroup>
          <RangeSummary>
            <strong>{stats.inRange}</strong>{' '}
            {range === 0 ? sinceLabel(stats.firstTimestamp) : rangeNoun(range)}
            {range !== 0 && (
              <Delta tone={tone}>
                {delta > 0 ? `+${delta}` : delta} {previousNoun(range)}
              </Delta>
            )}
          </RangeSummary>
        </RangeRow>

        <Bars dense={dense} aria-hidden="true">
          {stats.series.map((p, i) => (
            <Bar key={i} ratio={p.count / max} today={i === stats.series.length - 1} title={`${p.label}: ${p.count}`} />
          ))}
        </Bars>
        <BarLabels dense={dense} aria-hidden="true">
          {dense
            ? [stats.series[0], stats.series[stats.series.length - 1]].map((p, i) => <span key={i}>{p.label}</span>)
            : stats.series.map((p, i) => <span key={i}>{stats.series.length > 8 && i % 2 === 1 ? '' : p.label}</span>)}
        </BarLabels>

        <Grid>
          <Cell>
            <CellValue>{stats.sendTotal}</CellValue>
            <CellLabel>Send addresses</CellLabel>
          </Cell>
          <Cell>
            <CellValue>
              {stats.timelineTotal}
              {typeof accountTotal === 'number' && accountTotal > 0 && <small> of {accountTotal}</small>}
            </CellValue>
            <CellLabel>{typeof accountTotal === 'number' && accountTotal > 0 ? 'Made here, of account total' : 'Made with Qwacky'}</CellLabel>
          </Cell>
          <Cell>
            <CellValue>{taggedPercent}<small>%</small></CellValue>
            <CellLabel>Tagged</CellLabel>
          </Cell>
          <Cell>
            <CellValue>{fromPage}</CellValue>
            <CellLabel>From right-click or shortcut</CellLabel>
          </Cell>
        </Grid>

        {stats.topTags.length > 0 && (
          <TagRow aria-label="Most used tags">
            {stats.topTags.map(t => (
              <TagPill key={t.tag}>
                {t.tag} <b>{t.count}</b>
              </TagPill>
            ))}
          </TagRow>
        )}
      </Card>
      )}
    </>
  )
}
