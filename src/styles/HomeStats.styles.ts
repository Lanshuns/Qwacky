import styled from 'styled-components'

export const Card = styled.section`
  margin-bottom: var(--qw-card-mb, 12px);
  padding: var(--qw-card-pad, 12px 14px);
  background: ${props => props.theme.surfaceElevated};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 12px;
`

export const CardLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${props => props.theme.textTertiary};
  margin-bottom: 6px;
`

export const LatestRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  margin: 0 -10px;
  width: calc(100% + 20px);
  background: none;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: ${props => props.theme.text};
  transition: background 0.15s ease;

  &:hover {
    background: ${props => props.theme.primary}10;
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.borderFocus};
    outline-offset: 1px;
  }

  svg {
    flex-shrink: 0;
    color: ${props => props.theme.textSecondary};
  }
`

export const LatestValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  word-break: break-all;
  color: ${props => props.theme.text};
`

export const LatestMeta = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textTertiary};
  margin-top: 2px;
`

export const EmptyHint = styled.div`
  font-size: 13px;
  color: ${props => props.theme.textTertiary};
  padding: 4px 0;
`

export const Headline = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
`

export const HeadlineNumber = styled.span`
  font-size: var(--qw-headline-size, 34px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: ${props => props.theme.primary};
  font-variant-numeric: tabular-nums;
`

export const HeadlineText = styled.span`
  font-size: 13px;
  line-height: 1.3;
  color: ${props => props.theme.textSecondary};
`

export const RangeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`

export const RangeGroup = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  background: ${props => props.theme.hover};
  border-radius: 8px;
`

export const RangeButton = styled.button<{ active?: boolean }>`
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: ${props => props.active ? `${props.theme.primary}22` : 'transparent'};
  color: ${props => props.active ? props.theme.primary : props.theme.textSecondary};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    color: ${props => props.theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.borderFocus};
    outline-offset: 1px;
  }
`

export const RangeSummary = styled.div`
  text-align: right;
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  font-variant-numeric: tabular-nums;

  strong {
    font-size: 15px;
    font-weight: 700;
    color: ${props => props.theme.text};
    margin-right: 4px;
  }

  span {
    display: block;
  }
`

export const Delta = styled.span<{ tone: 'up' | 'down' | 'flat' }>`
  color: ${props => props.tone === 'up' ? props.theme.primary : props.theme.textSecondary};
`

export const Bars = styled.div<{ dense?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: ${props => props.dense ? '2px' : '6px'};
  height: var(--qw-bars-h, 48px);
  margin-bottom: 4px;
`

export const Bar = styled.div<{ ratio: number; today?: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  height: max(3px, calc(var(--qw-bars-h, 48px) * ${props => props.ratio}));
  border-radius: 3px 3px 1px 1px;
  background: ${props => props.today ? props.theme.primary : `${props.theme.primary}55`};
  transition: height 0.2s ease;
`

export const BarLabels = styled.div<{ dense?: boolean }>`
  display: flex;
  justify-content: ${props => props.dense ? 'space-between' : 'stretch'};
  gap: ${props => props.dense ? '0' : '6px'};
  margin-bottom: 10px;

  span {
    flex: ${props => props.dense ? '0 0 auto' : '1 1 0'};
    min-width: 0;
    text-align: center;
    font-size: 10px;
    color: ${props => props.theme.textTertiary};
    white-space: nowrap;
  }
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.borderLight};
`

export const Cell = styled.div`
  padding: 8px 10px;
  border-radius: 8px;
  background: ${props => props.theme.hover};
`

export const CellValue = styled.div`
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  color: ${props => props.theme.text};
  font-variant-numeric: tabular-nums;

  small {
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.theme.textTertiary};
    margin-left: 3px;
  }
`

export const CellLabel = styled.div`
  font-size: 11px;
  color: ${props => props.theme.textSecondary};
  margin-top: 2px;
`

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`

export const TagPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => props.theme.primary}18;
  color: ${props => props.theme.primary};

  b {
    font-weight: 700;
  }
`
