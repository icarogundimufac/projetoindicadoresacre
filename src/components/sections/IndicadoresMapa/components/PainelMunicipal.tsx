import { Building2 } from 'lucide-react'
import { MunicipioSelector } from '@/components/municipios/MunicipioSelector'
import { Toggle } from '@/components/ui/Toggle'
import type { MunicipioOption } from '@/types/municipio-dashboard'

interface PainelMunicipalProps {
  selectedSlug: string
  onChangeSlug: (slug: string) => void
  municipioOptions: MunicipioOption[]
  showEstadual: boolean
  onToggleEstadual: (checked: boolean) => void
  showSatellite: boolean
  onToggleSatellite: (checked: boolean) => void
}

export function PainelMunicipal({
  selectedSlug,
  onChangeSlug,
  municipioOptions,
  showEstadual,
  onToggleEstadual,
  showSatellite,
  onToggleSatellite,
}: PainelMunicipalProps) {
  return (
    <div className="bg-white rounded-xl border border-areia-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header accent */}
      <div className="h-1.5 bg-gradient-to-r from-verde-600 via-verde-500 to-verde-400" />

      {/* Municipal selector */}
      <div className="relative px-4 pt-4 pb-3 border-b border-areia-100 bg-gradient-to-b from-verde-50/50 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-verde-600 shadow-sm shadow-verde-600/25">
            <Building2 size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-verde-800 font-jakarta">
              Painel Municipal
            </p>
            <p className="text-[9px] text-areia-400 font-jakarta mt-0.5">
              Selecione um município
            </p>
          </div>
        </div>

        {municipioOptions.length > 0 && (
          <MunicipioSelector
            value={selectedSlug}
            onChange={onChangeSlug}
            options={municipioOptions}
            className="w-full"
          />
        )}
      </div>

      {/* Toggle: compare with state */}
      <div className="px-4 py-3 border-b border-areia-100 group/toggle-estadual">
        <Toggle
          checked={showEstadual}
          onChange={onToggleEstadual}
          label="Comparar com Estado"
        />
        <p className="text-[9px] text-areia-400 font-jakarta mt-1 ml-[42px]">
          Exibe média estadual nos indicadores
        </p>
      </div>

      {/* Toggle: satellite background */}
      <div className="px-4 py-3 group/toggle-satellite">
        <Toggle
          checked={showSatellite}
          onChange={onToggleSatellite}
          label="Fundo de satélite"
        />
        <p className="text-[9px] text-areia-400 font-jakarta mt-1 ml-[42px]">
          Imagem de satélite no mapa
        </p>
      </div>
    </div>
  )
}
