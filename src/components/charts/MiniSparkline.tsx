import type { TimeSeriesPoint } from '@/types/indicators'

interface MiniSparklineProps {
  data: TimeSeriesPoint[]
  color?: string
  height?: number
  showArea?: boolean
}

export function MiniSparkline({
  data,
  color = '#229157',
  height = 32,
  showArea = true,
}: MiniSparklineProps) {
  if (data.length < 2) return null

  const width = 112
  const padding = 2

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (d.value - min) / range) * (height - padding * 2)
    return { x, y }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath = showArea
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`
    : undefined

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {areaPath && (
        <path
          d={areaPath}
          fill={color}
          opacity={0.12}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
