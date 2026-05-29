import React, { useState, useEffect } from 'react'
import { fetchHourly, fetchList } from '../../services/apiXM.js'
import { METRICS, ENTITIES, formatDateForAPI, getYesterdayDate } from '../../config/constants.js'
import Spinner from '../ui/Spinner.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import EmptyMessage from '../ui/EmptyMessage.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PanelProduccion() {
  const yesterday = getYesterdayDate()
  const [startDate, setStartDate] = useState(yesterday.toISOString().split('T')[0])
  
  const endDate = yesterday.toISOString().split('T')[0]
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    setData([])

    try {
      // Validate dates
      if (new Date(startDate) > new Date(endDate)) {
        setError('La fecha de inicio no puede ser posterior a la fecha de fin.')
        setLoading(false)
        return
      }

      // Fetch resources list
      const listResult = await fetchList(METRICS.RESOURCES_LIST)
      const resources = listResult.data || listResult || []

      if (!Array.isArray(resources) || resources.length === 0) {
        setError('No se pudo obtener el listado de plantas.')
        setLoading(false)
        return
      }

      // Filter only DC (Despacho Central) resources
      const dcResources = resources.filter(r => 
        r.Despacho === 'Despacho Central' || 
        r.despacho === 'Despacho Central' ||
        r.Tipo === 'Despacho Central' ||
        (r.attributes && r.attributes.despacho === 'Despacho Central')
      )

      if (dcResources.length === 0) {
        setError('No hay plantas de Despacho Central disponibles.')
        setLoading(false)
        return
      }

      // Get generation data
      const genResult = await fetchHourly(
        METRICS.GENERATION,
        startDate,
        endDate,
        ENTITIES.RESOURCE
      )

      const generationData = genResult.data || genResult || []

      if (!Array.isArray(generationData) || generationData.length === 0) {
        setError('No hay datos de generación para el período seleccionado.')
        setLoading(false)
        return
      }

      // Aggregate generation by resource
      const generationByResource = {}
      generationData.forEach(record => {
        const resourceCode = record.Recurso || record.recurso || record.code
        const value = parseFloat(record.Valor) || record.value || 0
        
        if (resourceCode) {
          if (!generationByResource[resourceCode]) {
            generationByResource[resourceCode] = 0
          }
          generationByResource[resourceCode] += value
        }
      })

      // Create data with resource names
      const chartData = Object.entries(generationByResource)
        .map(([code, total]) => {
          const resource = resources.find(r => 
            (r.Código === code || r.código === code || r.code === code)
          )
          return {
            name: resource ? (resource.Nombre || resource.nombre || code) : code,
            generation: parseFloat(total.toFixed(2)),
            isDC: dcResources.some(r => r.Código === code || r.código === code || r.code === code)
          }
        })
        .filter(item => item.isDC)
        .sort((a, b) => b.generation - a.generation)
        .slice(0, 10)

      if (chartData.length === 0) {
        setError('No hay datos de plantas DC para el período seleccionado.')
        setLoading(false)
        return
      }

      setData(chartData)
    } catch (err) {
      console.error('Error fetching production data:', err)
      setError('No pudimos obtener los datos. Intenta de nuevo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Top 10 Plantas Despacho Central</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de fin
            </label>
            <input
              type="date"
              value={endDate}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={new Date(startDate) > new Date(endDate)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Consultar
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && <Spinner />}

      {error && !loading && <ErrorMessage message={error} />}

      {!loading && !error && data.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Selecciona un rango de fechas y haz clic en "Consultar" para ver el top 10
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Generación Total por Planta</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
              />
              <YAxis label={{ value: 'Generación (MWh)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => `${value.toFixed(2)} MWh`}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="generation" fill="#f59e0b" name="Generación (MWh)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
