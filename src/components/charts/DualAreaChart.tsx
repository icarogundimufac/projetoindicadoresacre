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
  value1: number
  value2: number
}

export interface DualAreaChartProps {
  data: DataPoint[]
  label1: string
  label2: string
  color1?: string
  color2?: string
  height?: number
  format?: 'number' | 'currency'
}

interface TooltipContentProps {
  active?: boolean
  payload?: Array<{ payload: DataPoint }>
}

function applyFormat(value: number, format: 'number' | 'currency') {
  if (format === 'currency') return formatCompactCurrency(value)
  return formatNumber(value)
}

function TooltipCard({
  active,
  payload,
  format,
}: TooltipContentProps & {
  format: 'number' | 'currency'
}) {
  if (!active || !payload?.length) return null

  const datum = payload[0]?.payload
  if (!datum) return null

  return (
    <div className="rounded-xl border border-areia-200 bg-white px-3 py-2 shadow-xl text-xs font-jakarta">
      <p className="text-[10px] font-bold uppercase tracking-widest text-areia-400 mb-1">
        {datum.year}
      </p>
      <div className="space-y-1">
        <p className="tabular-nums font-semibold text-verde-900">
          {applyFormat(datum.value1, format)}
        </p>
        <p className="tabular-nums font-semibold text-verde-900">
          {applyFormat(datum.value2, format)}
        </p>
      </div>
    </div>
  )
}

function DualAreaChartInternal({
  data,
  label1,
  label2,
  color1 = '#0f5b36',
  color2 = '#229157',
  height = 280,
  format = 'number',
}: DualAreaChartProps) {
  if (data.length === 0) return null

  const allValues = data.flatMap((d) => [d.value1, d.value2])
  const maxValue = Math.max(...allValues)
  const gradientId1 = `dual-area-1-${color1.replace('#', '')}`
  const gradientId2 = `dual-area-2-${color2.replace('#', '')}`

  return (
    <div style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 20, bottom: 20, left: 48 }}>
          <defs>
            <linearGradient id={gradientId1} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color1} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color1} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={gradientId2} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color2} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color2} stopOpacity={0.02} />
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
            tickFormatter={(value: number) => applyFormat(value, format)}
            tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            cursor={{ stroke: '#e5e1d6', strokeDasharray: '4 4' }}
            content={<TooltipCard format={format} />}
          />
          <Area
            type="monotone"
            dataKey="value1"
            name={label1}
            stroke={color1}
            strokeWidth={2.5}
            fill={`url(#${gradientId1})`}
          />
          <Area
            type="monotone"
            dataKey="value2"
            name={label2}
            stroke={color2}
            strokeWidth={2.5}
            strokeDasharray="6 4"
            fill={`url(#${gradientId2})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export const DualAreaChart = React.memo(DualAreaChartInternal)
