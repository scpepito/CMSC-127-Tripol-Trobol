import { useState } from 'react'
import DriversPage from './features/drivers/DriversPage.jsx'
import VehiclesPage from './features/vehicles/VehiclesPage.jsx'
import { AppFrame } from './components/index.js'

function App() {
  const [route, setRoute] = useState({ key: 'drivers' })

  function navigate(next) {
    if (typeof next === 'string') {
      setRoute({ key: next })
      return
    }
    if (next && typeof next === 'object' && typeof next.key === 'string') {
      setRoute(next)
    }
  }

  if (route.key === 'drivers') {
    return (
      <DriversPage
        onNavigate={navigate}
        openLicenseNumber={route.driverLicenseNumber}
        returnTo={route.returnTo ?? null}
      />
    )
  }

  if (route.key === 'vehicles') {
    return <VehiclesPage onNavigate={navigate} openPlateNumber={route.plateNumber} />
  }

  return (
    <AppFrame activeKey={route.key} onNavigate={navigate}>
      <div className="p-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-2xl font-bold text-slate-900">HELLOOOOOOOOOO</div>
          <div className="mt-2 text-sm text-slate-500">
            This page is not implemented yet. Please select other page from the sidebar.
          </div>
        </div>
      </div>
    </AppFrame>
  )
}

export default App
