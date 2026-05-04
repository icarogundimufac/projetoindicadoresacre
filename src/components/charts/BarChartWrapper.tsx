import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/lib/utils/format'

interface DataPoint {
  label: string
  value: number
  [key: string]: string | number
}

export interface BarChartWrapperProps {
  data: DataPoint[]
  color?: string
  unit?: string
  height?: number
  horizontal?: boolean
  showLegend?: boolean
}

const BRAND_COLORS = ['#229157', '#0f5b36', '#44b375', '#7bd09e', '#c0392b', '#e74c3c']

const MAX_HORIZONTAL_LABEL_LENGTH = 32

function truncateLabel(label: string, maxLength = MAX_HORIZONTAL_LABEL_LENGTH) {
  if (label.length <= maxLength) return label

  return `${label.slice(0, maxLength - 1).trimEnd()}…`
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
        {datum.label}
      </p>
      <p className="tabular-nums font-semibold text-verde-900">
        {formatNumber(datum.value)}
        {unit ? ` ${unit}` : ''}
      </p>
    </div>
  )
}

function VerticalChart({
  data,
  color,
  unit,
}: {
  data: DataPoint[]
  color: string
  unit: string
}) {
  return (
    <BarChart data={data} margin={{ top: 16, right: 12, bottom: 32, left: 24 }}>
      <CartesianGrid stroke="#f0ede6" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
        axisLine={false}
        tickLine={false}
        dy={8}
      />
      <YAxis
        tickFormatter={(value: number) => formatNumber(value)}
        tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
        axisLine={false}
        tickLine={false}
        width={56}
      />
      <Tooltip cursor={{ fill: '#faf8f3' }} content={<TooltipCard unit={unit} />} />
      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
        {data.map((datum, index) => (
          <Cell
            key={datum.label}
            fill={BRAND_COLORS[index % BRAND_COLORS.length] ?? color}
          />
        ))}
      </Bar>
    </BarChart>
  )
}

function HorizontalChart({
  data,
  color,
  unit,
}: {
  data: DataPoint[]
  color: string
  unit: string
}) {
  function renderCategoryTick({
    x = 0,
    y = 0,
    payload,
  }: {
    x?: number
    y?: number
    payload?: { value?: string }
  }) {
    const label = String(payload?.value ?? '')

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{label}</title>
        <text
          x={-10}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#514b40"
          fontSize={11}
          fontFamily="var(--font-jakarta)"
          fontWeight={600}
        >
          {truncateLabel(label)}
        </text>
      </g>
    )
  }

  return (
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 8, right: 48, bottom: 16, left: 16 }}
      barCategoryGap="18%"
    >
      <CartesianGrid stroke="#f0ede6" strokeDasharray="3 3" horizontal={false} />
      <XAxis
        type="number"
        tickFormatter={(value: number) => formatNumber(value)}
        tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        type="category"
        dataKey="label"
        tick={renderCategoryTick}
        axisLine={false}
        tickLine={false}
        width={220}
        interval={0}
        tickMargin={10}
      />
      <Tooltip cursor={{ fill: '#faf8f3' }} content={<TooltipCard unit={unit} />} />
      <Bar dataKey="value" radius={[0, 10, 10, 0]}>
        <LabelList
          dataKey="value"
          position="right"
          offset={10}
          formatter={(value: number) => formatNumber(value)}
          fill="#6f6758"
          fontSize={10}
          fontFamily="var(--font-jakarta)"
          className="tabular-nums"
        />
        {data.map((datum, index) => (
          <Cell
            key={datum.label}
            fill={BRAND_COLORS[index % BRAND_COLORS.length] ?? color}
          />
        ))}
      </Bar>
    </BarChart>
  )
}

function BarChartWrapperInternal({
  data,
  color = '#229157',
  unit = '',
  height = 280,
  horizontal = false,
}: BarChartWrapperProps) {
  if (data.length === 0) return null

  return (
    <div style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        {horizontal ? (
          <HorizontalChart data={data} color={color} unit={unit} />
        ) : (
          <VerticalChart data={data} color={color} unit={unit} />
        )}
      </ResponsiveContainer>
    </div>
  )
}

export const BarChartWrapper = React.memo(BarChartWrapperInternal)
