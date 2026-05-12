import { Skeleton } from '@/components/ui/Skeleton'

export function MapaSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4">
        {/* Left panel skeleton */}
        <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-verde-600 via-verde-500 to-verde-400" />
          <div className="px-4 pt-4 pb-3 border-b border-areia-100 bg-gradient-to-b from-verde-50/50 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <Skeleton className="h-2 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Map skeleton */}
        <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-verde-400 via-verde-300 to-verde-400" />
          <div className="px-4 py-2.5 border-b border-areia-100">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-[340px] w-full" />
        </div>

        {/* Right panel skeleton */}
        <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-1 bg-gradient-to-r from-ouro-400 via-ouro-300 to-ouro-400" />
          <div className="px-5 py-4 border-b border-areia-100 space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-2 w-28" />
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-areia-50/60 border border-areia-100 p-3 flex flex-col gap-2">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-5 w-16" />
                {i === 2 && <Skeleton className="h-1 w-full rounded-full" />}
                <Skeleton className="h-2 w-14" />
              </div>
            ))}
          </div>
          <div className="flex-1 px-4 pb-4 flex flex-col">
            <div className="flex-1 rounded-lg bg-areia-50/40 border border-areia-100 p-4 flex flex-col gap-3">
              <Skeleton className="h-2.5 w-28" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-2.5 w-10" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="bg-white rounded-xl border border-areia-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-ouro-400 via-ouro-300 to-ouro-400" />
        <div className="border-b border-areia-200 px-5 py-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-5">
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, si) => (
              <div key={si}>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, ci) => (
                    <div key={ci} className="rounded-xl border border-areia-100 p-4 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-2.5 w-20" />
                        <Skeleton className="h-3.5 w-8 rounded" />
                      </div>
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[280px] rounded-xl" />
    </div>
  )
}
