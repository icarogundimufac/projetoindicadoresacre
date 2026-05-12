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
      { label: 'Apresentação', href: '/', icon: 'grid' },
    ],
  },
  {
    label: 'Indicadores',
    items: [
      { label: 'Indicadores', href: '/indicadores', icon: 'bar-chart' },
    ],
  },
]
