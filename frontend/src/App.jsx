import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import PanelPrecios from './components/panels/PanelPrecios.jsx'
import PanelProduccion from './components/panels/PanelProduccion.jsx'
import PanelConsumo from './components/panels/PanelConsumo.jsx'
import PanelAgua from './components/panels/PanelAgua.jsx'

function App() {
  const [activePanel, setActivePanel] = useState('precios')

  const renderPanel = () => {
    switch (activePanel) {
      case 'precios':
        return <PanelPrecios />
      case 'produccion':
        return <PanelProduccion />
      case 'consumo':
        return <PanelConsumo />
      case 'agua':
        return <PanelAgua />
      default:
        return <PanelPrecios />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      <main className="flex-1 overflow-auto lg:ml-0">
        {renderPanel()}
      </main>
    </div>
  )
}

export default App
