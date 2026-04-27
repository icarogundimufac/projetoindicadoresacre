import { useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils/cn'
import { StatDelta } from '@/components/ui/StatDelta'
import type { Indicator } from '@/types/indicators'

interface TableRow {
  id: string
  label: string
  description: string
  latestValue: number | string
  unit: string
  delta?: number
  deltaDirection?: 'up' | 'down' | 'neutral'
  positiveDirection?: 'up' | 'down'
  year?: number
  source: string
}

interface IndicatorDataTableProps {
  indicators: Indicator[]
  sectionId: string
}

const columnHelper = createColumnHelper<TableRow>()

export function IndicatorDataTable({ indicators, sectionId }: IndicatorDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const rows: TableRow[] = indicators.map((ind) => {
    const latestPoint = ind.timeSeries.at(-1)
    const year = latestPoint?.year ?? undefined

    let positiveDirection: 'up' | 'down' | undefined
    if (sectionId === 'saude') {
      positiveDirection = ind.id.includes('mortalidade') ? 'down' : 'up'
    } else if (sectionId === 'seguranca') {
      positiveDirection = 'down'
    }

    let latestValue: number | string = ind.latestValue ?? '-'
    if (ind.unit === 'R$' && typeof latestValue === 'number') {
      latestValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(latestValue)
    } else if (typeof latestValue === 'number') {
      latestValue = latestValue.toLocaleString('pt-BR')
    }

    return {
      id: ind.id,
      label: ind.label,
      description: ind.description,
      latestValue,
      unit: ind.unit === 'R$' ? '' : ind.unit,
      delta: ind.delta,
      deltaDirection: ind.deltaDirection,
      positiveDirection,
      year,
      source: ind.source,
    }
  })

  const columns = [
    columnHelper.accessor('label', {
      header: 'Indicador',
      cell: (info) => (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-verde-900 font-jakarta truncate">
            {info.getValue()}
          </p>
          <p className="text-[11px] text-areia-500 font-jakarta line-clamp-1">
            {info.row.original.description}
          </p>
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('latestValue', {
      header: 'Último Valor',
      cell: (info) => (
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-verde-950 font-fraunces tabular-nums">
            {info.getValue()}
          </span>
          {info.row.original.unit && (
            <span className="text-[11px] text-areia-500 font-jakarta">
              {info.row.original.unit}
            </span>
          )}
        </div>
      ),
      sortingFn: (a, b) => {
        const av = a.original.latestValue
        const bv = b.original.latestValue
        if (typeof av === 'number' && typeof bv === 'number') return av - bv
        return String(av).localeCompare(String(bv))
      },
    }),
    columnHelper.accessor('delta', {
      header: 'Variação',
      cell: (info) => {
        const value = info.getValue()
        if (value === undefined) return <span className="text-areia-400 text-xs">—</span>
        return (
          <StatDelta
            delta={value}
            deltaDirection={info.row.original.deltaDirection}
            positiveDirection={info.row.original.positiveDirection}
          />
        )
      },
      sortingFn: (a, b) => (a.original.delta ?? 0) - (b.original.delta ?? 0),
    }),
    columnHelper.accessor('year', {
      header: 'Ano',
      cell: (info) => (
        <span className="text-xs text-areia-500 font-jakarta tabular-nums">
          {info.getValue() ?? '—'}
        </span>
      ),
      sortingFn: (a, b) => (a.original.year ?? 0) - (b.original.year ?? 0),
    }),
    columnHelper.accessor('source', {
      header: 'Fonte',
      cell: (info) => (
        <span className="text-[11px] text-areia-500 font-jakarta">
          {info.getValue()}
        </span>
      ),
      enableSorting: false,
    }),
  ]

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-areia-200 bg-white shadow-sm">
      <div className="border-b border-areia-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-verde-900 font-fraunces">
          Todos os Indicadores
        </h3>
        <p className="mt-0.5 text-xs text-areia-400 font-jakarta">
          Clique no cabeçalho para ordenar por valor, variação ou ano.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-areia-50/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-areia-500 font-jakarta',
                      header.column.getCanSort() &&
                        'cursor-pointer select-none transition-colors hover:text-verde-800',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-[9px]">
                          {header.column.getIsSorted() === 'asc'
                            ? '▲'
                            : header.column.getIsSorted() === 'desc'
                              ? '▼'
                              : '◦'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  'transition-colors hover:bg-areia-50/60',
                  index % 2 === 0 ? 'bg-white' : 'bg-areia-50/30',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-3.5 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
