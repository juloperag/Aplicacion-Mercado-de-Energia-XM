import React, { useState, useEffect } from 'react'
import { fetchHourly, fetchList } from '../../services/apiXM.js'
import { METRICS, ENTITIES, formatDateForAPI, getYesterdayDate } from '../../config/constants.js'
import Spinner from '../ui/Spinner.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import EmptyMessage from '../ui/EmptyMessage.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PanelConsumo() {
  const today = new Date()
  const currentMonth = today.toISOString().split('T')[0].substring(0, 7)
  
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [month, setMonth] = useState(currentMonth)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const result = await fetchList(METRICS.AGENTS_LIST)
        const agentsList = result.data || result || []
        if (Array.isArray(agentsList) && agentsList.length > 0) {
          setAgents(agentsList)
        }
      } catch (err) {
        console.error('Error fetching agents:', err)
      }
    }
    fetchAgents()
  }, [])

  const filteredAgents = agents.filter(agent => {
    const agentName = agent.Nombre || agent.nombre || agent.name || ''
    return agentName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent)
    setSearchTerm(agent.Nombre || agent.nombre || agent.name || '')
    setShowDropdown(false)
  }

  const handleFetch = async () => {
    if (!selectedAgent) {
      setError('Selecciona un agente comercializador.')
      return
    }

    setLoading(true)
    setError(null)
    setData([])

    try {
      // Parse month to get start and end dates
      const [year, monthNum] = month.split('-')
      const startDate = `${year}-${monthNum}-01`
      
      // Get last day of month
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
      const endDate = `${year}-${monthNum}-${lastDay}`

      const agentCode = selectedAgent.Código || selectedAgent.código || selectedAgent.code
      
      const result = await fetchHourly(
        METRICS.DEMAND_COMMERCIAL,
        startDate,
        endDate,
        ENTITIES.AGENT,
        [agentCode]
      )

      const demandData = result.data || result || []

      if (!Array.isArray(demandData) || demandData.length === 0) {
        setError('No hay datos de consumo para el agente y período seleccionado.')
        setLoading(false)
        return
      }

      // Format data for chart
      const chartData = demandData.map((record, idx) => ({
        time: `${record.Fecha || ''} ${String(idx % 24).padStart(2, '0')}:00`,
        demand: parseFloat(record.Valor) || record.value || 0,
        date: record.Fecha || ''
      })).sort((a, b) => new Date(a.time) - new Date(b.time))

      setData(chartData)
    } catch (err) {
      console.error('Error fetching consumption data:', err)
      setError('No pudimos obtener los datos. Intenta de nuevo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Consumo por Agente Comercializador</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Agent Selector with Search */}
          <div className="relative">
            <label htmlFor="agent-search" className="block text-sm font-medium text-gray-700 mb-2">
              Agente Comercializador
            </label>
            <div className="relative">
              <input
                id="agent-search"
                type="text"
                placeholder="Busca un agente..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {showDropdown && filteredAgents.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredAgents.map((agent, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAgent(agent)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                    >
                      {agent.Nombre || agent.nombre || agent.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Month Picker */}
          <div>
            <label htmlFor="month-picker" className="block text-sm font-medium text-gray-700 mb-2">
              Mes de consulta
            </label>
            <input
              id="month-picker"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleFetch}
          disabled={!selectedAgent}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          Consultar
        </button>
      </div>

      {/* Content */}
      {loading && <Spinner />}

      {error && !loading && <ErrorMessage message={error} />}

      {!loading && !error && data.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Selecciona un agente y mes, luego haz clic en "Consultar" para ver los datos
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Demanda de {selectedAgent.Nombre || selectedAgent.nombre || selectedAgent.name}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis label={{ value: 'Demanda (MWh)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => `${value.toFixed(2)} MWh`}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="demand" 
                stroke="#06b6d4" 
                name="Demanda"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
