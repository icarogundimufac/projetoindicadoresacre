import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Compass,
  Database,
  Buildings,
  CaretLeft,
  CaretRight,
  ChartBar,
  MapPin,
  GraduationCap,
  Heartbeat,
  ShieldCheck,
  Bank,
  ArrowUpRight,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

type AccentKey = 'verde' | 'ouro' | 'areia' | 'estrela'

interface Slide {
  number: string
  kicker: string
  icon: React.ElementType
  title: string
  lead: string
  text: string
  accent: AccentKey
  tags: string[]
}

const SLIDES: Slide[] = [
  {
    number: '01',
    kicker: 'Apresentação',
    icon: BookOpen,
    title: 'Portal de Indicadores do Acre',
    lead: 'Quatro áreas estratégicas, 22 municípios e séries históricas em um único endereço público.',
    text: 'Plataforma oficial do Governo do Estado do Acre destinada à consulta pública de indicadores estratégicos. Reúne dados de educação, saúde, segurança e orçamento, organizados em séries históricas e comparativos entre os 22 municípios, com o propósito de subsidiar o planejamento governamental, fortalecer a transparência e apoiar o controle social sobre a implementação de políticas públicas.',
    accent: 'verde',
    tags: ['Educação', 'Saúde', 'Segurança', 'Orçamento'],
  },
  {
    number: '02',
    kicker: 'Como navegar',
    icon: Compass,
    title: 'Caminhos para explorar o portal',
    lead: 'Cada área foi desenhada para uma forma diferente de leitura — do panorama ao recorte municipal.',
    text: 'Use o Dashboard para a visão geral dos indicadores-chave, abra os Indicadores por área temática para análises detalhadas, consulte o Mapa Municipal para comparar as 22 cidades em um mesmo recorte e acesse os Mapas Temáticos para sobreposição de camadas geográficas como malha viária, unidades de saúde e áreas protegidas.',
    accent: 'areia',
    tags: ['Dashboard', 'Por área', 'Comparativo municipal', 'Camadas geográficas'],
  },
  {
    number: '03',
    kicker: 'Bases oficiais',
    icon: Database,
    title: 'Dados oficiais e atualizados',
    lead: 'Cada indicador exibe a fonte original, a data de referência e a periodicidade da publicação.',
    text: 'Os indicadores são alimentados por bases oficiais — IBGE, Ministério da Saúde, SESACRE, SEPLAN e demais secretarias estaduais. A atualização ocorre conforme a periodicidade de divulgação de cada fonte, com rastreamento da última publicação, metodologia documentada e identificação clara de notas técnicas e revisões.',
    accent: 'ouro',
    tags: ['IBGE', 'Min. Saúde', 'SESACRE', 'Secretarias estaduais'],
  },
  {
    number: '04',
    kicker: 'Institucional',
    icon: Buildings,
    title: 'Secretaria de Estado de Planejamento',
    lead: 'Uma iniciativa da SEPLAN para fortalecer a gestão pública baseada em evidências.',
    text: 'O portal é mantido pela SEPLAN como instrumento de planejamento, monitoramento de metas do Plano Plurianual (PPA) e promoção da transparência. Reúne em um só lugar dados que apoiam decisões de governo, controle social e formulação de políticas públicas no Estado do Acre.',
    accent: 'verde',
    tags: ['Planejamento', 'Monitoramento', 'PPA', 'Transparência'],
  },
]

const ACCENTS: Record<AccentKey, {
  chip: string
  rule: string
  numeral: string
  glow: string
  iconRing: string
  leadBorder: string
}> = {
  verde: {
    chip: 'bg-verde-50 text-verde-800 border-verde-200 dark:bg-verde-900/40 dark:text-verde-200 dark:border-verde-800/60',
    rule: 'bg-verde-500 dark:bg-verde-400',
    numeral: 'text-verde-700/85 dark:text-verde-200/85',
    glow: 'from-verde-100/80 via-white/0 to-white/0 dark:from-verde-900/40 dark:via-transparent dark:to-transparent',
    iconRing: 'text-verde-600 dark:text-verde-300',
    leadBorder: 'border-verde-300 dark:border-verde-400/60',
  },
  ouro: {
    chip: 'bg-ouro-50 text-ouro-800 border-ouro-200 dark:bg-ouro-700/25 dark:text-ouro-200 dark:border-ouro-700/40',
    rule: 'bg-ouro-500 dark:bg-ouro-300',
    numeral: 'text-ouro-600/90 dark:text-ouro-300/85',
    glow: 'from-ouro-50 via-white/0 to-white/0 dark:from-ouro-700/20 dark:via-transparent dark:to-transparent',
    iconRing: 'text-ouro-600 dark:text-ouro-300',
    leadBorder: 'border-ouro-300 dark:border-ouro-300/60',
  },
  areia: {
    chip: 'bg-areia-100 text-areia-800 border-areia-300 dark:bg-areia-800/40 dark:text-areia-100 dark:border-areia-700/50',
    rule: 'bg-areia-600 dark:bg-areia-300',
    numeral: 'text-areia-700/80 dark:text-areia-200/75',
    glow: 'from-areia-100 via-white/0 to-white/0 dark:from-areia-800/40 dark:via-transparent dark:to-transparent',
    iconRing: 'text-areia-700 dark:text-areia-200',
    leadBorder: 'border-areia-400 dark:border-areia-300/60',
  },
  estrela: {
    chip: 'bg-estrela-50 text-estrela-600 border-estrela-400/30',
    rule: 'bg-estrela-500',
    numeral: 'text-estrela-500/80',
    glow: 'from-estrela-50 via-white/0 to-white/0',
    iconRing: 'text-estrela-500',
    leadBorder: 'border-estrela-400/60',
  },
}

interface IndexItem {
  to: string
  label: string
  kind: string
  icon: React.ElementType
  iconText: string
}

const INDEX_ITEMS: IndexItem[] = [
  {
    to: '/indicadores/visao-geral',
    label: 'Visão Geral',
    kind: 'Painel',
    icon: ChartBar,
    iconText: 'text-verde-700 dark:text-verde-300',
  },
  {
    to: '/indicadores/mapa',
    label: 'Mapa Municipal',
    kind: 'Geográfico',
    icon: MapPin,
    iconText: 'text-ouro-600 dark:text-ouro-300',
  },
  {
    to: '/indicadores?secao=educacao',
    label: 'Educação',
    kind: 'Aprendizagem',
    icon: GraduationCap,
    iconText: 'text-blue-600 dark:text-blue-300',
  },
  {
    to: '/indicadores?secao=saude',
    label: 'Saúde',
    kind: 'Atenção',
    icon: Heartbeat,
    iconText: 'text-emerald-600 dark:text-emerald-300',
  },
  {
    to: '/indicadores?secao=seguranca',
    label: 'Segurança',
    kind: 'Ocorrências',
    icon: ShieldCheck,
    iconText: 'text-orange-600 dark:text-orange-300',
  },
  {
    to: '/indicadores?secao=orcamento',
    label: 'Orçamento',
    kind: 'Fiscal',
    icon: Bank,
    iconText: 'text-amber-600 dark:text-amber-300',
  },
]

const AUTO_ROTATE_INTERVAL = 7000
const TOTAL_SLIDES = SLIDES.length

export function ProjectPresentation() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index)
    setProgress(0)
  }, [])

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % TOTAL_SLIDES)
    setProgress(0)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (AUTO_ROTATE_INTERVAL / 100)
        if (prev >= 100) {
          nextSlide()
          return 0
        }
        return prev + increment
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  const currentSlide = SLIDES[activeIndex]
  const IconComponent = currentSlide.icon
  const accent = ACCENTS[currentSlide.accent]
  const nextSlideData = SLIDES[(activeIndex + 1) % TOTAL_SLIDES]

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl border border-areia-200 shadow-sm overflow-hidden',
        'dark:bg-[#4a5546] dark:border-white/12',
        'animate-slide-up',
      )}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-verde-300/70 to-transparent dark:via-verde-400/40" />

      {/* Header strip — eyebrow + numbered timeline */}
      <div className="flex items-center justify-between gap-4 border-b border-areia-100 px-5 py-3 sm:px-7 dark:border-white/8">
        <div className="flex items-center gap-2 font-jakarta text-[10px] font-bold uppercase tracking-[0.22em] text-verde-700 dark:text-verde-300">
          <span className="hidden sm:inline">Apresentação do projeto</span>
          <span className="sm:hidden">Projeto</span>
        </div>

        <nav aria-label="Navegação dos slides" className="flex items-center gap-0.5">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={slide.number}
                onClick={() => goToSlide(idx)}
                className={cn(
                  'group flex items-center gap-1.5 rounded-full px-2.5 py-1 font-jakarta text-[10px] tracking-[0.18em] transition-all duration-300',
                  isActive
                    ? 'bg-verde-800 text-white shadow-sm dark:bg-verde-300 dark:text-verde-950'
                    : 'text-areia-500 hover:bg-areia-100 hover:text-verde-700 dark:text-areia-300 dark:hover:bg-white/10 dark:hover:text-white',
                )}
                aria-label={`Ir para slide ${slide.number} ${slide.kicker}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="font-mono font-semibold">{slide.number}</span>
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap uppercase font-semibold transition-[max-width,opacity] duration-300',
                    isActive ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0',
                  )}
                >
                  <span className="hidden sm:inline">— {slide.kicker}</span>
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Slide body */}
      <div
        className="relative grid min-h-[400px] lg:min-h-[420px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* LEFT — visual / numeral */}
        <div className="relative overflow-hidden border-b border-areia-100 p-7 sm:p-9 lg:border-b-0 lg:border-r dark:border-white/8">
          {/* L1 — ambient accent wash */}
          <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', accent.glow)} />

          {/* L2 — concentric topographic rings emanating from bottom-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-[topoBreath_6s_ease-in-out_infinite] dark:animate-[topoBreathDark_6s_ease-in-out_infinite]"
            style={{
              background: `radial-gradient(circle at 100% 100%,
                transparent 36px, currentColor 36px, currentColor 37px,
                transparent 37px, transparent 88px, currentColor 88px, currentColor 89px,
                transparent 89px, transparent 152px, currentColor 152px, currentColor 153px,
                transparent 153px, transparent 228px, currentColor 228px, currentColor 229px,
                transparent 229px, transparent 316px, currentColor 316px, currentColor 317px,
                transparent 317px, transparent 416px, currentColor 416px, currentColor 417px,
                transparent 417px, transparent 528px, currentColor 528px, currentColor 529px,
                transparent 529px)`,
              color: 'rgb(107 99 85)',
            }}
          />

          {/* L2.5 — fine cartographic grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(176 170 152) 0.5px, transparent 0.5px),
                linear-gradient(to bottom, rgb(176 170 152) 0.5px, transparent 0.5px)
              `,
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse 100% 100% at 30% 30%, black 0%, black 50%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 30% 30%, black 0%, black 50%, transparent 85%)',
            }}
          />

          {/* L3 — dot grid with radial mask fading toward bottom-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply dark:opacity-[0.10] dark:mix-blend-screen"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              color: 'rgb(82 75 64)',
              maskImage:
                'radial-gradient(ellipse 110% 110% at 0% 0%, black 0%, black 32%, transparent 78%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 110% 110% at 0% 0%, black 0%, black 32%, transparent 78%)',
            }}
          />

          {/* L4 — warm accent blob (top-right) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                currentSlide.accent === 'ouro'
                  ? 'radial-gradient(closest-side, rgba(252,211,77,0.65), transparent)'
                  : currentSlide.accent === 'areia'
                    ? 'radial-gradient(closest-side, rgba(212,208,196,0.65), transparent)'
                    : 'radial-gradient(closest-side, rgba(123,208,158,0.55), transparent)',
            }}
          />

          {/* L5 — soft cream atmospheric blob (bottom-left, complementary) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-35 blur-3xl dark:opacity-20"
            style={{
              background: 'radial-gradient(closest-side, rgba(248, 246, 240, 0.85), transparent)',
            }}
          />

          {/* L5.5 — scattered cartographic markers */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* Cross marker - top area */}
            <span className="absolute left-[18%] top-[15%] flex items-center justify-center opacity-[0.18] dark:opacity-[0.14]">
              <span className="block h-[8px] w-px bg-areia-500 dark:bg-areia-400" />
              <span className="absolute block w-[8px] h-px bg-areia-500 dark:bg-areia-400" />
            </span>
            {/* Diamond marker - mid-left */}
            <span className="absolute left-[8%] top-[45%] h-[6px] w-[6px] rotate-45 border border-areia-400/60 dark:border-areia-400/40" />
            {/* Circle with dot - right side */}
            <span className="absolute right-[12%] top-[30%] flex h-[10px] w-[10px] items-center justify-center rounded-full border border-areia-400/50 dark:border-areia-400/35">
              <span className="block h-[2px] w-[2px] rounded-full bg-areia-500/70 dark:bg-areia-400/50" />
            </span>
            {/* Small cross - bottom-right area */}
            <span className="absolute right-[22%] bottom-[22%] flex items-center justify-center opacity-[0.16] dark:opacity-[0.12]">
              <span className="block h-[6px] w-px bg-areia-500 dark:bg-areia-400" />
              <span className="absolute block w-[6px] h-px bg-areia-500 dark:bg-areia-400" />
            </span>
            {/* Diamond - top-right area */}
            <span className="absolute right-[30%] top-[12%] h-[5px] w-[5px] rotate-45 border border-areia-400/50 dark:border-areia-400/35" />
            {/* Circle - bottom-left */}
            <span className="absolute left-[25%] bottom-[15%] h-[8px] w-[8px] rounded-full border border-areia-400/40 dark:border-areia-400/30" />
          </div>

          {/* L6 — surveyor's mark at the focal point of the rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 opacity-50 dark:opacity-40"
          >
            <span className="block h-px w-3 bg-areia-500 dark:bg-areia-300" />
            <span className="block h-1.5 w-1.5 rounded-full border border-areia-500 dark:border-areia-300" />
            <span className="block h-px w-3 bg-areia-500 dark:bg-areia-300" />
          </div>

          {/* L7 — typographic asterism (editorial ornament) */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-5 top-4 select-none"
          >
            <span className="font-fraunces text-[12px] italic font-light tracking-[0.5em] text-areia-500/55 dark:text-areia-300/45">
              ✶ ✶ ✶
            </span>
          </div>

          {/* L8 — noise / grain texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '180px 180px',
            }}
          />

          {/* Left-edge measurement ruler */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[3px] opacity-[0.15] dark:opacity-[0.10]"
            style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, rgb(176 170 152) 0px, rgb(176 170 152) 1px, transparent 1px, transparent 20px)',
              backgroundPosition: '0 8px',
            }}
          />

          {/* Corner vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgb(56 52 44) 100%)',
            }}
          />

          <div className="relative flex h-full flex-col justify-between gap-6">
            <div key={`numeral-${activeIndex}`} className="relative animate-fade-in">
              <div className="pointer-events-none absolute -left-2 -top-4 opacity-[0.07] dark:opacity-[0.12]">
                <IconComponent size={180} weight="duotone" className={accent.iconRing} />
              </div>

              <div
                className={cn(
                  'relative font-fraunces font-light italic leading-[0.85] tracking-tight',
                  'text-[120px] sm:text-[150px] lg:text-[170px]',
                  accent.numeral,
                )}
              >
                {currentSlide.number}
              </div>

              <div className="relative mt-4 flex items-center gap-3">
                <span className={cn('h-px w-12', accent.rule)} />
                <span className="font-jakarta text-[10px] font-semibold uppercase tracking-[0.3em] text-areia-500 dark:text-areia-300">
                  {currentSlide.number} / 0{TOTAL_SLIDES}
                </span>
              </div>
            </div>

            <div className="relative flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-areia-500 font-jakarta dark:text-areia-300">
              <IconComponent size={14} weight="duotone" className={accent.iconRing} />
              <span className="font-semibold">{currentSlide.kicker}</span>
            </div>
          </div>
        </div>

        {/* RIGHT — content */}
        <div className="relative flex flex-col px-7 py-8 sm:px-10 lg:px-12 lg:py-10">
          <div key={`content-${activeIndex}`} className="flex-1 animate-slide-up">
            <h2 className="max-w-xl font-fraunces text-[26px] font-medium leading-[1.08] tracking-tight text-verde-900 sm:text-[32px] lg:text-[36px] dark:text-white">
              {currentSlide.title}
            </h2>

            <p
              className={cn(
                'mt-4 max-w-xl border-l-2 pl-4 font-fraunces text-[15px] italic leading-snug text-areia-800 sm:text-[16.5px] dark:text-areia-100',
                accent.leadBorder,
              )}
            >
              {currentSlide.lead}
            </p>

            <p className="mt-4 max-w-xl font-jakarta text-[13.5px] leading-relaxed text-areia-700 sm:text-[14.5px] dark:text-areia-200">
              {currentSlide.text}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              {currentSlide.tags.map((tag, i) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 font-jakarta text-[11px] text-areia-600 dark:text-areia-300"
                >
                  {i > 0 && <span className="h-0.5 w-0.5 rounded-full bg-areia-400 dark:bg-areia-500" />}
                  <span className="h-1.5 w-1.5 rotate-45 bg-areia-300 dark:bg-areia-500" />
                  <span className="font-medium">{tag}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-areia-100 pt-4 dark:border-white/8">
            <div className="flex min-w-0 items-center gap-2 font-jakarta text-[11px] text-areia-500 dark:text-areia-300">
              <ArrowUpRight size={12} weight="bold" className="shrink-0 text-verde-600 dark:text-verde-300" />
              <span className="shrink-0 uppercase tracking-[0.18em]">A seguir</span>
              <span className="truncate font-medium text-areia-800 dark:text-areia-100">
                {nextSlideData.title}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={prevSlide}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border border-areia-200 bg-white text-areia-600 transition-all',
                  'hover:border-verde-300 hover:bg-verde-50 hover:text-verde-700',
                  'dark:border-white/12 dark:bg-white/5 dark:text-areia-300 dark:hover:bg-white/10 dark:hover:text-white',
                )}
                aria-label="Slide anterior"
              >
                <CaretLeft size={14} weight="bold" />
              </button>
              <button
                onClick={nextSlide}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border border-verde-200 bg-verde-50 text-verde-700 transition-all',
                  'hover:border-verde-400 hover:bg-verde-100',
                  'dark:border-verde-700/50 dark:bg-verde-900/30 dark:text-verde-200 dark:hover:bg-verde-900/50',
                )}
                aria-label="Próximo slide"
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-areia-100 dark:bg-white/10">
            <div
              className={cn('h-full transition-all duration-100 ease-linear', accent.rule)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Editorial index */}
      <div className="border-t border-areia-100 bg-areia-50/40 px-5 pb-7 pt-6 sm:px-7 dark:border-white/8 dark:bg-black/15">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-jakarta text-[11px] font-bold uppercase tracking-[0.24em] text-verde-700 dark:text-verde-300">
            Sumário · Acesso rápido
          </span>
          <span className="h-px flex-1 bg-areia-200 dark:bg-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2 sm:grid-flow-col sm:grid-rows-3">
          {INDEX_ITEMS.map((item, idx) => {
            const Icon = item.icon
            const numStr = (idx + 1).toString().padStart(2, '0')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'group relative flex items-center gap-4 rounded-lg px-3.5 py-5',
                  'transition-colors duration-200',
                  'border-b border-areia-100/70 last:border-b-0 dark:border-white/8',
                  'sm:[&:nth-child(3)]:border-b-0',
                  'hover:bg-white dark:hover:bg-white/[0.06]',
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-3 left-0.5 w-[3px] origin-bottom scale-y-0 rounded-full bg-verde-500 transition-transform duration-300 group-hover:scale-y-100 dark:bg-verde-300"
                />

                <span className="w-12 shrink-0 text-center font-fraunces text-[36px] font-light italic leading-none text-areia-400/90 transition-colors group-hover:text-verde-700 dark:text-areia-500 dark:group-hover:text-verde-300">
                  {numStr}
                </span>

                <span
                  aria-hidden
                  className="hidden h-9 w-px shrink-0 self-center bg-areia-200/80 sm:block dark:bg-white/10"
                />

                <Icon
                  size={26}
                  weight="duotone"
                  className={cn(
                    'shrink-0 transition-transform duration-200 group-hover:scale-110',
                    item.iconText,
                  )}
                />

                <span className="font-fraunces text-[20px] font-medium tracking-tight text-areia-900 transition-colors group-hover:text-verde-800 dark:text-white dark:group-hover:text-verde-200 sm:text-[22px]">
                  {item.label}
                </span>

                <span className="hidden font-jakarta text-[11px] font-bold uppercase tracking-[0.24em] text-areia-400 md:inline dark:text-areia-400">
                  · {item.kind}
                </span>

                <span
                  aria-hidden
                  className="mx-2.5 hidden h-px flex-1 self-center border-b border-dotted border-areia-300/70 transition-colors group-hover:border-verde-400/70 sm:block dark:border-white/15 dark:group-hover:border-verde-400/50"
                />

                <CaretRight
                  size={18}
                  weight="bold"
                  className="shrink-0 text-areia-300 transition-all duration-200 group-hover:translate-x-1.5 group-hover:text-verde-600 dark:text-areia-400 dark:group-hover:text-verde-300"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
