import React, { useState, useRef, useEffect } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import { ChevronDown, BarChart3, Check, TrendingUp, Layers } from 'lucide-react'
import { ChartCard } from './ChartCard'
import { formatNumber, formatCompactCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export interface TimeSeriesConfig {
  id: string
  label: string
  description?: string
  unit: string
  source: string
  timeSeries: { year: number; value: number }[]
  color: string
  chartType: 'line' | 'area'
  format?: 'number' | 'currency'
}

interface InteractiveTimeSeriesChartProps {
  series: TimeSeriesConfig[]
  defaultSelectedId?: string
  title?: string
  subtitle?: string
}

interface TooltipContentProps {
  active?: boolean
  payload?: Array<{ payload: { year: number; value: number } }>
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

function IndicatorDropdown({
  series,
  selectedId,
  onSelect,
}: {
  series: TimeSeriesConfig[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(() =>
    Math.max(0, series.findIndex((s) => s.id === selectedId)),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const styleId = 'indicator-dropdown-keyframes'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes dropdownItemIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
      document.head.appendChild(style)
    }
    return () => {
      const existing = document.getElementById(styleId)
      if (existing) existing.remove()
    }
  }, [])

  const selectedSeries = series.find((s) => s.id === selectedId) ?? series[0]

  useEffect(() => {
    setFocusedIndex(Math.max(0, series.findIndex((s) => s.id === selectedId)))
  }, [selectedId, series])

  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex >= 0) {
      const activeItem = listRef.current.querySelector<HTMLElement>(
        `#indicator-option-${series[focusedIndex]?.id}`,
      )
      if (activeItem && typeof activeItem.scrollIntoView === 'function') {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [focusedIndex, isOpen, series])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          setIsOpen(false)
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex((prev) => (prev + 1) % series.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex((prev) => (prev - 1 + series.length) % series.length)
          break
        case 'Home':
          event.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          event.preventDefault()
          setFocusedIndex(series.length - 1)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          onSelect(series[focusedIndex].id)
          setIsOpen(false)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, series, onSelect])

  function handleItemClick(id: string) {
    onSelect(id)
    setIsOpen(false)
  }

  if (!selectedSeries) return null

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        id="indicator-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="indicator-listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'group inline-flex items-center gap-2.5 rounded-full pl-3 pr-2 py-1.5 text-[11px] font-semibold font-jakarta border transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
          'border-verde-800 bg-verde-800 text-white shadow-sm',
        )}
      >
        <BarChart3 size={13} className="text-white/90" />
        <span className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-[11px]">{selectedSeries.label}</span>
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white/90 min-w-[18px]">
          {series.length}
        </span>
        <span className="mx-0.5 h-3 w-px bg-white/20" />
        <ChevronDown
          size={12}
          className={cn(
            'text-white/70 transition-transform duration-300',
            isOpen ? 'rotate-180' : 'rotate-0',
          )}
        />
      </button>

      {/* Dropdown overlay */}
      <div
        id="indicator-listbox"
        ref={listRef}
        role="listbox"
        aria-labelledby="indicator-trigger"
        aria-activedescendant={`indicator-option-${series[focusedIndex]?.id ?? ''}`}
        className={cn(
          'absolute top-full mt-2 right-0 z-50 bg-white rounded-2xl border border-areia-200 shadow-2xl overflow-hidden',
          'origin-top-right',
          isOpen
            ? 'transition-all duration-300 ease-out scale-100 opacity-100'
            : 'transition-all duration-200 ease-in scale-95 opacity-0 pointer-events-none',
        )}
        style={{
          maxHeight: isOpen ? 'min(70vh, 520px)' : '0px',
          width: 'clamp(300px, 40vw, 380px)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-areia-100 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-verde-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-verde-900 font-jakarta">
              Indicadores
            </span>
          </div>
          <span className="text-[10px] font-semibold text-areia-400 bg-areia-50 px-2 py-0.5 rounded-full">
            {series.length} disponíveis
          </span>
        </div>

        {/* Items */}
        <div className="overflow-y-auto py-1.5 scrollbar-thin scrollbar-thumb-areia-200 scrollbar-track-transparent">
          {series.map((s, index) => {
            const isActive = s.id === selectedId
            const isFocused = index === focusedIndex
            const Icon = s.chartType === 'area' ? TrendingUp : BarChart3

            return (
              <button
                key={s.id}
                id={`indicator-option-${s.id}`}
                type="button"
                role="option"
                aria-selected={isActive}
                tabIndex={-1}
                onClick={() => handleItemClick(s.id)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors duration-150',
                  isActive
                    ? 'bg-verde-50/80'
                    : isFocused
                      ? 'bg-areia-50'
                      : 'hover:bg-areia-50/50',
                )}
                style={{
                  animation: isOpen ? `dropdownItemIn 350ms ${Math.min(index * 40, 300)}ms cubic-bezier(0.16, 1, 0.3, 1) forwards` : 'none',
                  opacity: isOpen ? undefined : 0,
                  transform: isOpen ? undefined : 'translateY(-8px)',
                }}
              >
                {/* Color indicator + icon */}
                <div className="relative mt-0.5 flex-shrink-0">
                  <div
                    className={cn(
                      'rounded-lg flex items-center justify-center transition-all duration-200',
                      isActive ? 'w-8 h-8 shadow-sm' : 'w-7 h-7',
                    )}
                    style={{
                      backgroundColor: isActive ? `${s.color}18` : `${s.color}12`,
                    }}
                  >
                    <Icon
                      size={isActive ? 15 : 13}
                      style={{ color: s.color }}
                    />
                  </div>
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white"
                      style={{ backgroundColor: s.color }}
                    >
                      <Check size={8} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-sm font-jakarta truncate',
                        isActive
                          ? 'font-bold text-verde-900'
                          : 'font-medium text-verde-900/80',
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="text-[10px] font-semibold text-areia-400 bg-areia-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      {s.unit}
                    </span>
                  </div>
                  {s.description && (
                    <p className="mt-0.5 text-[11px] text-areia-400 leading-snug line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer hint */}
        <div className="sticky bottom-0 border-t border-areia-100 bg-areia-50/60 px-4 py-2 flex items-center justify-center gap-3">
          <span className="text-[10px] text-areia-400 font-jakarta flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center justify-center rounded bg-white border border-areia-200 px-1 py-0.5 text-[9px] font-sans font-medium text-areia-500 min-w-[18px]">↑</kbd>
            <kbd className="hidden sm:inline-flex items-center justify-center rounded bg-white border border-areia-200 px-1 py-0.5 text-[9px] font-sans font-medium text-areia-500 min-w-[18px]">↓</kbd>
            navegar
          </span>
          <span className="text-areia-300">·</span>
          <span className="text-[10px] text-areia-400 font-jakarta flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center justify-center rounded bg-white border border-areia-200 px-1.5 py-0.5 text-[9px] font-sans font-medium text-areia-500">Enter</kbd>
            selecionar
          </span>
        </div>
      </div>
    </div>
  )
}

function InteractiveTimeSeriesChartComponent({
  series,
  defaultSelectedId,
  title,
  subtitle,
}: InteractiveTimeSeriesChartProps) {
  const [selectedId, setSelectedId] = useState(
    defaultSelectedId ?? series[0]?.id ?? '',
  )

  const selectedSeries = series.find((s) => s.id === selectedId) ?? series[0]

  if (!selectedSeries || series.length === 0) return null

  const format = selectedSeries.format ?? 'number'

  const yMax = Math.max(...selectedSeries.timeSeries.map((d) => d.value))
  const yMin = Math.min(...selectedSeries.timeSeries.map((d) => d.value))
  const domainPadding = Math.max((yMax - yMin) * 0.15, 1)

  const gradientId = `area-gradient-${selectedSeries.color.replace('#', '')}`

  return (
    <ChartCard
      title={title ?? selectedSeries.label}
      subtitle={subtitle ?? selectedSeries.description ?? `Evolução temporal — ${selectedSeries.unit}`}
      source={selectedSeries.source}
      action={
        <IndicatorDropdown
          series={series}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      }
    >
      <div
        key={selectedId}
        className="animate-fade-in motion-reduce:animate-none"
        style={{ height: 360, minHeight: 360 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {selectedSeries.chartType === 'area' ? (
            <AreaChart
              data={selectedSeries.timeSeries}
              margin={{ top: 16, right: 20, bottom: 20, left: 40 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedSeries.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={selectedSeries.color} stopOpacity={0.02} />
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
                domain={[Math.max(0, yMin - domainPadding), yMax + domainPadding]}
                tickFormatter={(value: number) => applyFormat(value, format, selectedSeries.unit)}
                tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
                axisLine={false}
                tickLine={false}
                width={68}
              />
              <Tooltip
                cursor={{ stroke: '#e5e1d6', strokeDasharray: '4 4' }}
                content={<TooltipCard format={format} unit={selectedSeries.unit} />}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={selectedSeries.color}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={12}
                  formatter={(value: number) => applyFormat(value, format, selectedSeries.unit)}
                  style={{
                    fill: selectedSeries.color,
                    fontSize: 10,
                    fontFamily: 'var(--font-jakarta)',
                    fontWeight: 600,
                  }}
                />
              </Area>
            </AreaChart>
          ) : (
            <LineChart
              data={selectedSeries.timeSeries}
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
                tickFormatter={(value: number) => applyFormat(value, format, selectedSeries.unit)}
                tick={{ fill: '#8c8472', fontSize: 11, fontFamily: 'var(--font-jakarta)' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                cursor={{ stroke: '#e5e1d6', strokeDasharray: '4 4' }}
                content={<TooltipCard format={format} unit={selectedSeries.unit} />}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={selectedSeries.color}
                strokeWidth={3}
                dot={{ r: 5, fill: selectedSeries.color, stroke: '#fff', strokeWidth: 2.5 }}
                activeDot={{ r: 6, fill: selectedSeries.color, stroke: '#fff', strokeWidth: 2.5 }}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={12}
                  formatter={(value: number) => applyFormat(value, format, selectedSeries.unit)}
                  style={{
                    fill: selectedSeries.color,
                    fontSize: 10,
                    fontFamily: 'var(--font-jakarta)',
                    fontWeight: 600,
                  }}
                />
              </Line>
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export const InteractiveTimeSeriesChart = React.memo(InteractiveTimeSeriesChartComponent)