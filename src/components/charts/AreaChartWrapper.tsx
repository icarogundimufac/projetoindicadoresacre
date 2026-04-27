import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompactCurrency, formatNumber } from '@/lib/utils/format'

interface DataPoint {
  year: number
  value: number
}

export interface AreaChartWrapperProps {
  data: DataPoint[]
  color?: string
  unit?: string
  height?: number
  format?: 'number' | 'currency'
}

interface TooltipContentProps {
  active?: boolean
  payload?: Array<{ payload: DataPoint }>
}

function applyFormat(value: number, format: 'number' | 'currency', unit: string) {
  if (format === 'currency') return formatCompactCurrency(value)
  return `${formatNumber(value)}${unit ? ` ${unit}` : ''}`
}

function TooltipCard({
  active,
  payload,
  format,
  unit,
}: TooltipContentProps & {
  format: 'number' | 'currency'
  unit: string
}) {
  if (!active || !payload?.length) return null

  const datum = payload[0]?.payload

  if (!datum) return null

  return (
    <div className="rounded-xl border border-areia-200 bg-white px-3 py-2 shadow-xl text-xs font-jakarta">
      <p className="text-[10px] font-bold uppercase tracking-widest text-areia-400 mb-1">
        {datum.year}
      </p>
      <p className="tabular-nums font-semibold text-verde-900">
        {applyFormat(datum.value, format, unit)}
      </p>
    </div>
  )
}

function AreaChartWrapperInternal({
  data,
  color = '#229157',
  unit = '',
  height = 280,
  format = 'number',
}: AreaChartWrapperProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map((datum) => datum.value))
  const gradientId = `area-gradient-${color.replace('#', '')}`

  return (
    <div style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 20, bottom: 20, left: 40 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f0ede6" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={[0, maxValue * 1.15]}
            tickFormatter={(value: number) => applyFormat(value, format, unit)}
            tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip
            cursor={{ stroke: '#e5e1d6', strokeDasharray: '4 4' }}
            content={<TooltipCard format={format} unit={unit} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export const AreaChartWrapper = React.memo(AreaChartWrapperInternal)
