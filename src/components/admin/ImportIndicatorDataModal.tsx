import { useRef, useState } from 'react'
import { Upload, X, FileSpreadsheet } from 'lucide-react'
import { MUNICIPIOS } from '@/lib/constants/municipios'

interface ImportIndicatorDataModalProps {
  indicatorLabel: string
  onImport: (file: File) => void
  onDownloadTemplate: (years: number[]) => void
  onClose: () => void
}

const inputClass =
  'w-full rounded-md border border-areia-200 bg-white px-3 py-2 text-sm text-areia-700 font-jakarta focus:border-verde-400 focus:outline-none focus:ring-1 focus:ring-verde-200 transition-colors'
const labelClass =
  'block text-[11px] font-bold uppercase tracking-[0.1em] text-areia-500 font-jakarta mb-1'

export function ImportIndicatorDataModal({
  indicatorLabel,
  onImport,
  onDownloadTemplate,
  onClose,
}: ImportIndicatorDataModalProps) {
  const [years, setYears] = useState<number[]>([new Date().getFullYear()])
  const [yearInput, setYearInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addYear() {
    const y = Number(yearInput.trim())
    if (Number.isFinite(y) && y > 1900 && y < 2100 && !years.includes(y)) {
      setYears((prev) => [...prev, y].sort((a, b) => a - b))
      setYearInput('')
    }
  }

  function removeYear(y: number) {
    setYears((prev) => prev.filter((v) => v !== y))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImport(file)
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-areia-200 bg-white shadow-xl animate-fade-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-areia-400 hover:text-areia-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="border-b border-areia-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-verde-800 font-fraunces">
            Importar Dados Municipais
          </h2>
          <p className="mt-1 text-[12px] text-areia-500 font-jakarta">
            Importe dados de {indicatorLabel || 'variavel'} por municipio e ano.
          </p>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div>
            <label className={labelClass}>Anos para o modelo</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {years.map((y) => (
                <span
                  key={y}
                  className="inline-flex items-center gap-1 rounded-md bg-verde-50 border border-verde-200 px-2 py-0.5 text-[11px] font-semibold text-verde-700 font-jakarta"
                >
                  {y}
                  <button
                    type="button"
                    onClick={() => removeYear(y)}
                    className="text-verde-400 hover:text-verde-600"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={yearInput}
                onChange={(e) => setYearInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addYear()
                  }
                }}
                placeholder="Ex: 2024"
                className={`${inputClass} w-32`}
              />
              <button
                type="button"
                onClick={addYear}
                className="rounded-md border border-areia-200 bg-white px-3 text-[12px] font-semibold text-areia-600 shadow-sm hover:border-verde-300 hover:text-verde-700 font-jakarta"
              >
                Adicionar ano
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-areia-100 bg-areia-50/50 p-4">
            <h3 className="text-[13px] font-semibold text-verde-800 font-jakarta mb-2">
              Formato do arquivo
            </h3>
            <p className="text-[11px] text-areia-500 font-jakarta mb-2">
              O arquivo deve conter linhas com os municipios do Acre e colunas com os anos. Formatos aceitos: XLSX, CSV e JSON.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] text-areia-600 font-jakarta">
                <thead>
                  <tr className="border-b border-areia-200">
                    <th className="py-1 pr-2 text-left font-semibold text-areia-500">Municipio</th>
                    {years.slice(0, 3).map((y) => (
                      <th key={y} className="py-1 px-2 text-right font-semibold text-areia-500">{y}</th>
                    ))}
                    {years.length > 3 && (
                      <th className="py-1 px-2 text-right font-semibold text-areia-500">...</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {MUNICIPIOS.slice(0, 3).map((m) => (
                    <tr key={m.slug} className="border-b border-areia-100">
                      <td className="py-0.5 pr-2">{m.nome}</td>
                      {years.slice(0, 3).map((y) => (
                        <td key={y} className="py-0.5 px-2 text-right text-areia-300">—</td>
                      ))}
                      {years.length > 3 && (
                        <td className="py-0.5 px-2 text-right text-areia-300">...</td>
                      )}
                    </tr>
                  ))}
                  <tr className="text-areia-300">
                    <td className="py-0.5 pr-2">...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => onDownloadTemplate(years)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-verde-200 bg-verde-50 px-3 py-2 text-[12px] font-semibold text-verde-700 shadow-sm transition hover:bg-verde-100 font-jakarta"
            >
              <FileSpreadsheet size={14} />
              Baixar modelo
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-areia-200 bg-white px-4 py-2 text-[12px] font-semibold text-areia-500 shadow-sm transition hover:text-areia-700 font-jakarta"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-verde-600 px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-verde-700 font-jakarta"
              >
                <Upload size={14} />
                Importar arquivo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv,.json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}