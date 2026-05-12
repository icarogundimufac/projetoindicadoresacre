import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AdminShortcutHandler } from '@/components/admin/AdminShortcutHandler'
import { AppShell } from '@/components/layout/AppShell'

const DashboardRoute = lazy(() =>
  import('@/routes/DashboardRoute').then((module) => ({ default: module.DashboardRoute })),
)
const IndicadoresRoute = lazy(() =>
  import('@/routes/IndicadoresRoute').then((module) => ({ default: module.IndicadoresRoute })),
)
const IndicadoresVisaoGeral = lazy(() =>
  import('@/components/sections/IndicadoresVisaoGeral').then((module) => ({
    default: module.IndicadoresVisaoGeral,
  })),
)
const IndicadoresMapaRoute = lazy(() =>
  import('@/routes/IndicadoresMapaRoute').then((module) => ({
    default: module.IndicadoresMapaRoute,
  })),
)
const MapasRoute = lazy(() =>
  import('@/routes/MapasRoute').then((module) => ({ default: module.MapasRoute })),
)
const AdminDataRoute = lazy(() =>
  import('@/routes/AdminDataRoute').then((module) => ({ default: module.AdminDataRoute })),
)
const AdminLoginRoute = lazy(() =>
  import('@/routes/AdminLoginRoute').then((module) => ({ default: module.AdminLoginRoute })),
)

function RouteFallback() {
  return (
    <div className="px-8 py-10">
      <div className="bg-white rounded-xl border border-areia-200 p-6 shadow-sm animate-pulse">
        <div className="h-4 w-40 bg-areia-200 rounded mb-4" />
        <div className="h-24 w-full bg-areia-100 rounded" />
      </div>
    </div>
  )
}

function PublicLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function SectionRedirect({ sectionId }: { sectionId: string }) {
  return <Navigate to={`/indicadores/visao-geral?secao=${sectionId}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminShortcutHandler />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginRoute />} />
          <Route path="/admin/dados" element={<AdminDataRoute />} />
          <Route element={<PublicLayout />}>
            <Route path="/" element={<DashboardRoute />} />
            <Route path="/indicadores" element={<IndicadoresRoute />}>
              <Route index element={<Navigate to="/indicadores/visao-geral" replace />} />
              <Route path="visao-geral" element={<IndicadoresVisaoGeral />} />
              <Route path="mapa" element={<IndicadoresMapaRoute />} />
            </Route>
            <Route path="/educacao" element={<SectionRedirect sectionId="educacao" />} />
            <Route path="/saude" element={<SectionRedirect sectionId="saude" />} />
            <Route path="/seguranca" element={<SectionRedirect sectionId="seguranca" />} />
            <Route path="/orcamento" element={<SectionRedirect sectionId="orcamento" />} />
            <Route path="/mapas" element={<MapasRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
