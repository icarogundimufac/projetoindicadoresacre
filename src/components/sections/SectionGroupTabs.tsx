import { cn } from '@/lib/utils/cn'

interface GroupTab {
  id: string
  label: string
  count?: number
}

interface SectionGroupTabsProps {
  groups: GroupTab[]
  activeGroupId: string
  onChange: (groupId: string) => void
}

export function SectionGroupTabs({
  groups,
  activeGroupId,
  onChange,
}: SectionGroupTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-areia-200 bg-white p-1.5 shadow-sm">
      {groups.map((group) => {
        const isActive = group.id === activeGroupId
        return (
          <button
            key={group.id}
            onClick={() => onChange(group.id)}
            className={cn(
              'relative flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold font-jakarta transition-all duration-200',
              isActive
                ? 'bg-verde-600 text-white shadow-sm'
                : 'text-areia-600 hover:bg-areia-50 hover:text-verde-800',
            )}
          >
            {group.label}
            {typeof group.count === 'number' && (
              <span
                className={cn(
                  'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-areia-100 text-areia-500',
                )}
              >
                {group.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
