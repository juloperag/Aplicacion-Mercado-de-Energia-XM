// API Configuration
export const API_BASE_URL = 'https://servapibi.xm.com.co'

// Metric IDs
export const METRICS = {
  // Precios
  PRICE_NATIONAL: 'PrecBolsNaci',
  
  // Producción
  GENERATION: 'Gene',
  RESOURCES_LIST: 'ListadoRecursos',
  
  // Consumo
  DEMAND_COMMERCIAL: 'DemaCome',
  AGENTS_LIST: 'ListadoAgentes',
  
  // Agua
  RESERVOIR_VOLUME: 'PorcVoluUtilDiar',
  RESERVOIRS_LIST: 'ListadoEmbalse'
}

// Entities
export const ENTITIES = {
  SYSTEM: 'Sistema',
  RESOURCE: 'Recurso',
  AGENT: 'Agente',
  RESERVOIR: 'Embalse'
}

// Date format utilities
export const formatDateForAPI = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getYesterdayDate = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d
}
