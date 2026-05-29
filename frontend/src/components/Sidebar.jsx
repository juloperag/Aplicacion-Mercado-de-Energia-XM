import React, { useState } from 'react'

export default function Sidebar({ activePanel, setActivePanel }) {
  const [isOpen, setIsOpen] = useState(false)

  const panels = [
    { id: 'precios', label: 'Precios', icon: '💰' },
    { id: 'produccion', label: 'Producción', icon: '⚡' },
    { id: 'consumo', label: 'Consumo', icon: '📊' },
    { id: 'agua', label: 'Agua', icon: '💧' },
  ]

  const handlePanelChange = (panelId) => {
    setActivePanel(panelId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:w-64 lg:h-screen lg:bg-gradient-to-b lg:from-blue-600 lg:to-blue-800 lg:flex lg:flex-col lg:p-6 lg:shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-8">XM Energy</h1>
        <nav className="space-y-4 flex-1">
          {panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => handlePanelChange(panel.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                activePanel === panel.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-white hover:bg-blue-500'
              }`}
            >
              <span className="mr-3">{panel.icon}</span>
              {panel.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="w-64 h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col p-6 mt-16">
            <h1 className="text-2xl font-bold text-white mb-8">XM Energy</h1>
            <nav className="space-y-4">
              {panels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => handlePanelChange(panel.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    activePanel === panel.id
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-white hover:bg-blue-500'
                  }`}
                >
                  <span className="mr-3">{panel.icon}</span>
                  {panel.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
