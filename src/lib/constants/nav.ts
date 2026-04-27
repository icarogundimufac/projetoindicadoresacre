export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export const NAV: NavSection[] = [
  {
    label: 'Visão Geral',
    items: [
      { label: 'Dashboard', href: '/', icon: 'grid' },
    ],
  },
  {
    label: 'Indicadores',
    items: [
      { label: 'Indicadores', href: '/indicadores', icon: 'bar-chart' },
    ],
  },
  {
    label: 'Território',
    items: [
      { label: 'Municípios', href: '/municipios', icon: 'building' },
    ],
  },
]
