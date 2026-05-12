import { MapPin } from 'lucide-react'
import { AnimatedSelect } from '@/components/ui/AnimatedSelect'
import type { MunicipioOption } from '@/types/municipio-dashboard'

interface MunicipioSelectorProps {
  value: string
  onChange: (slug: string) => void
  options: MunicipioOption[]
  className?: string
}

export function MunicipioSelector({
  value,
  onChange,
  options,
  className,
}: MunicipioSelectorProps) {
  const groups = [
    {
      options: options.map((opt) => ({ key: opt.slug, label: opt.nome })),
    },
  ] as const

  return (
    <AnimatedSelect
      value={value}
      onChange={onChange}
      groups={groups}
      icon={<MapPin size={14} />}
      placeholder="Selecione um município..."
      className={className}
    />
  )
}