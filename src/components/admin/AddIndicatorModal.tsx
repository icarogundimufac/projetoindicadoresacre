import { useRef, useState } from 'react'
import { Upload, X, FileSpreadsheet } from 'lucide-react'
import {
  INDICATOR_SECTION_IDS,
  INDICATOR_SECTION_META,
  type IndicatorSectionId,
} from '@/lib/constants/indicator-sections'

export interface AddIndicatorFormData {
  sectionId: IndicatorSectionId
  groupId: string
  groupLabel: string
  indicatorLabel: string
  description: string
  unit: string
  source: string
}

interface AddIndicatorModalProps {
  bundleGroups: Record<IndicatorSectionId, Array<{ id: string; label: string }>>
  onConfirm: (data: AddIndicatorFormData) => void
  onImportFile: (file: File) => void
  onDownloadTemplate: () => void
  onClose: () => void
}

const inputClass =
  'w-full rounded-md border border-areia-200 bg-white px-3 py-2 text-sm text-areia-700 font-jakarta focus:border-verde-400 focus:outline-none focus:ring-1 focus:ring-verde-200 transition-colors'
const selectClass =
  'w-full rounded-md border border-areia-200 bg-white px-3 py-2 text-sm text-areia-700 font-jakarta focus:border-verde-400 focus:outline-none focus:ring-1 focus:ring-verde-200 transition-colors'
const labelClass =
  'block text-[11px] font-bold uppercase tracking-[0.1em] text-areia-500 font-jakarta mb-1'

export function AddIndicatorModal({
  bundleGroups,
  onConfirm,
  onImportFile,
  onDownloadTemplate,
  onClose,
}: AddIndicatorModalProps) {
  const [step, setStep] = useState<'form' | 'options'>('form')
  const [sectionId, setSectionId] = useState<IndicatorSectionId>('educacao')
  const [groupId, setGroupId] = useState('')
  const [groupLabel, setGroupLabel] = useState('')
  const [indicatorLabel, setIndicatorLabel] = useState('')
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState('')
  const [source, setSource] = useState('')
  const [isNewGroup, setIsNewGroup] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentGroups = bundleGroups[sectionId] ?? []

  const canSubmit =
    indicatorLabel.trim() !== '' &&
    (isNewGroup ? groupLabel.trim() !== '' : groupId !== '')

  function handleSubmit() {
    if (!canSubmit) return
    onConfirm({
      sectionId,
      groupId: isNewGroup ? groupLabel.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_').replace(/^_|_$/g, '') : groupId,
      groupLabel: isNewGroup ? groupLabel.trim() : (currentGroups.find((g) => g.id === groupId)?.label ?? groupId),
      indicatorLabel: indicatorLabel.trim(),
      description: description.trim(),
      unit: unit.trim(),
      source: source.trim(),
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImportFile(file)
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
            Adicionar Variavel
          </h2>
          <p className="mt-1 text-[12px] text-areia-500 font-jakarta">
            Preencha os metadados da variavel ou importe um arquivo com os dados.
          </p>
        </div>

        {step === 'form' ? (
          <div className="space-y-4 px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Secao *</label>
                <select
                  value={sectionId}
                  onChange={(e) => {
                    setSectionId(e.currentTarget.value as IndicatorSectionId)
                    setGroupId('')
                    setIsNewGroup(false)
                  }}
                  className={selectClass}
                >
                  {INDICATOR_SECTION_IDS.map((id) => (
                    <option key={id} value={id}>
                      {INDICATOR_SECTION_META[id].badge}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Grupo *</label>
                {isNewGroup ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={groupLabel}
                      onChange={(e) => setGroupLabel(e.currentTarget.value)}
                      placeholder="Nome do novo grupo"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => { setIsNewGroup(false); setGroupLabel('') }}
                      className="whitespace-nowrap rounded-md border border-areia-200 px-2 text-[11px] text-areia-500 hover:text-areia-700"
                    >
                      Existente
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <select
                      value={groupId}
                      onChange={(e) => setGroupId(e.currentTarget.value)}
                      className={selectClass}
                    >
                      <option value="">Selecione...</option>
                      {currentGroups.map((g) => (
                        <option key={g.id} value={g.id}>{g.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => { setIsNewGroup(true); setGroupId('') }}
                      className="whitespace-nowrap rounded-md border border-verde-200 px-2 text-[11px] text-verde-600 hover:bg-verde-50"
                    >
                      + Novo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Nome da Variavel *</label>
              <input
                type="text"
                value={indicatorLabel}
                onChange={(e) => setIndicatorLabel(e.currentTarget.value)}
                placeholder="Ex: Taxa de alfabetizacao"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Descricao</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                placeholder="Breve descricao da variavel..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Unidade de Medida</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.currentTarget.value)}
                  placeholder="Ex: %, pontos, hab"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Fonte de Dados</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.currentTarget.value)}
                  placeholder="Ex: IBGE, INEP"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('options')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-areia-200 bg-white px-3 py-2 text-[12px] font-semibold text-areia-600 shadow-sm transition hover:border-verde-300 hover:text-verde-700 font-jakarta"
              >
                <Upload size={14} />
                Importar arquivo
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
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="rounded-lg bg-verde-600 px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-verde-700 disabled:cursor-not-allowed disabled:opacity-50 font-jakarta"
                >
                  Criar variavel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-6 py-4">
            <div className="rounded-xl border border-areia-100 bg-areia-50/50 p-4">
              <h3 className="text-[13px] font-semibold text-verde-800 font-jakarta mb-2">
                Importar variavel via arquivo
              </h3>
              <p className="text-[11px] text-areia-500 font-jakarta mb-3">
                Faca o download do modelo, preencha com os dados e importe. Formatos aceitos: XLSX, CSV e JSON.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onDownloadTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-verde-200 bg-verde-50 px-3 py-1.5 text-[11px] font-semibold text-verde-700 shadow-sm transition hover:bg-verde-100 font-jakarta"
                >
                  <FileSpreadsheet size={13} />
                  Baixar modelo em branco
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-verde-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-verde-700 font-jakarta"
                >
                  <Upload size={13} />
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

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="rounded-lg border border-areia-200 bg-white px-4 py-2 text-[12px] font-semibold text-areia-600 shadow-sm transition hover:text-areia-700 font-jakarta"
              >
                Voltar ao formulario
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-areia-200 bg-white px-4 py-2 text-[12px] font-semibold text-areia-500 shadow-sm transition hover:text-areia-700 font-jakarta"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}