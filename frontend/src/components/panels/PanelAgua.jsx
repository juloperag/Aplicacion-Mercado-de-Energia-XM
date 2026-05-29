import React, { useState, useEffect } from 'react'
import { fetchDaily, fetchList } from '../../services/apiXM.js'
import { METRICS, ENTITIES, formatDateForAPI, getYesterdayDate } from '../../config/constants.js'
import Spinner from '../ui/Spinner.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import EmptyMessage from '../ui/EmptyMessage.jsx'

export default function PanelAgua() {
  const yesterday = getYesterdayDate()
  const [reservoirs, setReservoirs] = useState([])
  const [selectedReservoirs, setSelectedReservoirs] = useState([])
  const [startDate, setStartDate] = useState(yesterday.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(yesterday.toISOString().split('T')[0])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch reservoirs on component mount
  useEffect(() => {
    const fetchReservoirs = async () => {
      try {
        const result = await fetchList(METRICS.RESERVOIRS_LIST)
        const reservoirsList = result.data || result || []
        if (Array.isArray(reservoirsList) && reservoirsList.length > 0) {
          setReservoirs(reservoirsList)
        }
      } catch (err) {
        console.error('Error fetching reservoirs:', err)
      }
    }
    fetchReservoirs()
  }, [])

  const filteredReservoirs = reservoirs.filter(res => {
    const resName = res.Nombre || res.nombre || res.name || ''
    return resName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const toggleReservoir = (reservoir) => {
    const isSelected = selectedReservoirs.some(r => 
      (r.Código || r.código || r.code) === (reservoir.Código || reservoir.código || reservoir.code)
    )
    
    if (isSelected) {
      setSelectedReservoirs(selectedReservoirs.filter(r => 
        (r.Código || r.código || r.code) !== (reservoir.Código || reservoir.código || reservoir.code)
      ))
    } else {
      setSelectedReservoirs([...selectedReservoirs, reservoir])
    }
  }

  const getRowColor = (level) => {
    const numLevel = parseFloat(level)
    if (numLevel < 30) return 'bg-red-100'
    if (numLevel < 60) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  const getStatusBadge = (level) => {
    const numLevel = parseFloat(level)
    if (numLevel < 30) return 'Crítico'
    if (numLevel < 60) return 'Moderado'
    return 'Saludable'
  }

  const getStatusColor = (level) => {
    const numLevel = parseFloat(level)
    if (numLevel < 30) return 'text-red-700 bg-red-50'
    if (numLevel < 60) return 'text-yellow-700 bg-yellow-50'
    return 'text-green-700 bg-green-50'
  }

  const handleFetch = async () => {
    if (selectedReservoirs.length === 0) {
      setError('Selecciona al menos un embalse.')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.')
      return
    }

    setLoading(true)
    setError(null)
    setData([])

    try {
      const reservoirCodes = selectedReservoirs.map(r => r.Código || r.código || r.code)
      
      const result = await fetchDaily(
        METRICS.RESERVOIR_VOLUME,
        startDate,
        endDate,
        ENTITIES.RESERVOIR,
        reservoirCodes
      )

      const volumeData = result.data || result || []

      if (!Array.isArray(volumeData) || volumeData.length === 0) {
        setError('No hay datos disponibles para los embalses y período seleccionado.')
        setLoading(false)
        return
      }

      // Format data for table
      const tableData = volumeData.map((record) => {
        const resCode = record.Embalse || record.embalse || record.code
        const reservoir = reservoirs.find(r => 
          (r.Código === resCode || r.código === resCode || r.code === resCode)
        )
        
        return {
          date: record.Fecha || record.fecha || '',
          reservoir: reservoir ? (reservoir.Nombre || reservoir.nombre || resCode) : resCode,
          level: parseFloat(record.Valor) || record.value || 0,
          fullData: record
        }
      }).sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date)
        return dateCompare !== 0 ? dateCompare : a.reservoir.localeCompare(b.reservoir)
      })

      setData(tableData)
    } catch (err) {
      console.error('Error fetching water data:', err)
      setError('No pudimos obtener los datos. Intenta de nuevo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Nivel de Embalses</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Reservoir Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona embalses
          </label>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Busca un embalse..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {showDropdown && filteredReservoirs.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredReservoirs.map((res, idx) => {
                  const isSelected = selectedReservoirs.some(r => 
                    (r.Código || r.código || r.code) === (res.Código || res.código || res.code)
                  )
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleReservoir(res)}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        isSelected ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded border mr-3 ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`} />
                        {res.Nombre || res.nombre || res.name}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected Reservoirs Tags */}
          {selectedReservoirs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedReservoirs.map((res, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {res.Nombre || res.nombre || res.name}
                  <button
                    onClick={() => toggleReservoir(res)}
                    className="hover:text-blue-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleFetch}
          disabled={selectedReservoirs.length === 0 || new Date(startDate) > new Date(endDate)}
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
          Selecciona embalses y rango de fechas, luego haz clic en "Consultar" para ver los datos
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Embalse</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-800">Nivel (%)</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b transition-colors ${getRowColor(row.level)}`}
                  >
                    <td className="px-6 py-3 text-sm text-gray-700">{row.date}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{row.reservoir}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-right text-gray-900">
                      {row.level.toFixed(2)}%
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.level)}`}>
                        {getStatusBadge(row.level)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
