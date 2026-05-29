import React, { useState } from 'react'
import { fetchHourly } from '../../services/apiXM.js'
import { METRICS, ENTITIES, formatDateForAPI, getYesterdayDate } from '../../config/constants.js'
import Spinner from '../ui/Spinner.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import EmptyMessage from '../ui/EmptyMessage.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function PanelPrecios() {
  const [selectedDate, setSelectedDate] = useState(getYesterdayDate().toISOString().split('T')[0])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    setData([])
    setStats(null)

    try {
      const result = await fetchHourly(
        METRICS.PRICE_NATIONAL,
        selectedDate,
        selectedDate,
        ENTITIES.SYSTEM
      )

      const prices = result.data || result || []

      if (!Array.isArray(prices) || prices.length === 0) {
        setError('No hay datos disponibles para la fecha seleccionada.')
        setLoading(false)
        return
      }

      // Extract values and sort for box plot calculation
      const values = prices
        .map(p => parseFloat(p.Valor) || p.value || 0)
        .filter(v => !isNaN(v))
        .sort((a, b) => a - b)

      if (values.length === 0) {
        setError('No hay datos válidos para la fecha seleccionada.')
        setLoading(false)
        return
      }

      // Calculate statistics
      const min = values[0]
      const max = values[values.length - 1]
      const q1 = values[Math.floor(values.length * 0.25)]
      const median = values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)]
      const q3 = values[Math.floor(values.length * 0.75)]
      const mean = values.reduce((a, b) => a + b, 0) / values.length

      setStats({ min, q1, median, q3, max, mean, count: values.length })

      // Format data for chart - add hour info
      const chartData = prices.map((p, idx) => ({
        hour: `${String(idx).padStart(2, '0')}:00`,
        price: parseFloat(p.Valor) || p.value || 0,
        fullData: p
      }))

      setData(chartData)
    } catch (err) {
      console.error('Error fetching prices:', err)
      setError('No pudimos obtener los datos. Intenta de nuevo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Precio de Bolsa Nacional</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona una fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleFetch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Consultar
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && <Spinner />}

      {error && !loading && <ErrorMessage message={error} />}

      {!loading && !error && data.length === 0 && !stats && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Selecciona una fecha y haz clic en "Consultar" para ver los datos
        </div>
      )}

      {!loading && !error && data.length > 0 && stats && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Mínimo</p>
              <p className="text-2xl font-bold text-blue-600">${stats.min.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Q1</p>
              <p className="text-2xl font-bold text-purple-600">${stats.q1.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Mediana</p>
              <p className="text-2xl font-bold text-green-600">${stats.median.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Q3</p>
              <p className="text-2xl font-bold text-orange-600">${stats.q3.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Máximo</p>
              <p className="text-2xl font-bold text-red-600">${stats.max.toFixed(2)}</p>
            </div>
          </div>

          {/* Average */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-600">
            <p className="text-gray-700 text-lg">
              <span className="font-semibold">Precio Promedio del Día:</span>
              <span className="text-3xl font-bold text-blue-600 ml-4">${stats.mean.toFixed(2)}</span>
            </p>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Evolución de Precios (24 horas)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis label={{ value: 'Precio ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2563eb" 
                  name="Precio"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
