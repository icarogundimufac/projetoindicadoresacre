import React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/lib/utils/format'

interface DataPoint {
  year: number
  value1: number
  value2: number
}

export interface DualLineChartProps {
  data: DataPoint[]
  label1: string
  label2: string
  color1?: string
  color2?: string
  unit?: string
  height?: number
}

interface TooltipContentProps {
  active?: boolean
  payload?: Array<{ payload: DataPoint }>
}

function TooltipCard({ active, payload, unit }: TooltipContentProps & { unit?: string }) {
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
          {formatNumber(datum.value1)}
          {unit ? ` ${unit}` : ''}
        </p>
        <p className="tabular-nums font-semibold text-verde-900">
          {formatNumber(datum.value2)}
          {unit ? ` ${unit}` : ''}
        </p>
      </div>
    </div>
  )
}

function DualLineChartInternal({
  data,
  label1,
  label2,
  color1 = '#157244',
  color2 = '#44b375',
  unit = '',
  height = 280,
}: DualLineChartProps) {
  if (data.length === 0) return null

  const allValues = data.flatMap((d) => [d.value1, d.value2])
  const yMax = Math.max(...allValues)
  const yMin = Math.min(...allValues)
  const domainPadding = Math.max((yMax - yMin) * 0.15, 1)

  return (
    <div style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 20, bottom: 20, left: 24 }}
        >
          <CartesianGrid stroke="#f0ede6" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={[Math.max(0, yMin - domainPadding), yMax + domainPadding]}
            tickFormatter={(value: number) => formatNumber(value)}
            tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: '#e5e1d6', strokeDasharray: '4 4' }}
            content={<TooltipCard unit={unit} />}
          />
          <Line
            type="monotone"
            dataKey="value1"
            name={label1}
            stroke={color1}
            strokeWidth={2.5}
            dot={{ r: 4, fill: color1, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: color1, stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="value2"
            name={label2}
            stroke={color2}
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={{ r: 4, fill: color2, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: color2, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const DualLineChart = React.memo(DualLineChartInternal)
