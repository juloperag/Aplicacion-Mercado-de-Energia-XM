import { API_BASE_URL, formatDateForAPI } from '../config/constants.js'

/**
 * Calculates the difference in days between two dates
 */
const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Splits a date range into chunks of maxDays
 * Returns array of {startDate, endDate} objects
 */
const splitDateRange = (startDate, endDate, maxDays = 30) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const chunks = []
  
  let currentStart = new Date(start)
  
  while (currentStart < end) {
    let currentEnd = new Date(currentStart)
    currentEnd.setDate(currentEnd.getDate() + maxDays)
    
    if (currentEnd > end) {
      currentEnd = new Date(end)
    }
    
    chunks.push({
      startDate: formatDateForAPI(currentStart),
      endDate: formatDateForAPI(currentEnd)
    })
    
    currentStart = new Date(currentEnd)
    currentStart.setDate(currentStart.getDate() + 1)
  }
  
  return chunks
}

/**
 * Makes a POST request to the XM API
 */
const makeRequest = async (endpoint, body) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  const data = await response.json()
  return data
}

/**
 * Fetches hourly data from the API
 * Automatically splits requests for date ranges > 30 days
 */
export const fetchHourly = async (metricId, startDate, endDate, entity, filter = []) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Check if range exceeds 30 days
  const days = daysBetween(start, end)
  
  if (days > 30) {
    // Split into chunks
    const chunks = splitDateRange(start, end, 30)
    const allResults = []
    
    for (const chunk of chunks) {
      const body = {
        MetricId: metricId,
        StartDate: chunk.startDate,
        EndDate: chunk.endDate,
        Entity: entity
      }
      
      if (filter && filter.length > 0) {
        body.Filter = filter
      }
      
      try {
        const result = await makeRequest('/hourly', body)
        if (result && Array.isArray(result.data)) {
          allResults.push(...result.data)
        } else if (Array.isArray(result)) {
          allResults.push(...result)
        }
      } catch (error) {
        console.error('Error fetching chunk:', error)
        throw error
      }
    }
    
    return { data: allResults }
  } else {
    // Single request
    const body = {
      MetricId: metricId,
      StartDate: formatDateForAPI(start),
      EndDate: formatDateForAPI(end),
      Entity: entity
    }
    
    if (filter && filter.length > 0) {
      body.Filter = filter
    }
    
    return makeRequest('/hourly', body)
  }
}

/**
 * Fetches daily data from the API
 * Automatically splits requests for date ranges > 30 days
 */
export const fetchDaily = async (metricId, startDate, endDate, entity, filter = []) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Check if range exceeds 30 days
  const days = daysBetween(start, end)
  
  if (days > 30) {
    // Split into chunks
    const chunks = splitDateRange(start, end, 30)
    const allResults = []
    
    for (const chunk of chunks) {
      const body = {
        MetricId: metricId,
        StartDate: chunk.startDate,
        EndDate: chunk.endDate,
        Entity: entity
      }
      
      if (filter && filter.length > 0) {
        body.Filter = filter
      }
      
      try {
        const result = await makeRequest('/daily', body)
        if (result && Array.isArray(result.data)) {
          allResults.push(...result.data)
        } else if (Array.isArray(result)) {
          allResults.push(...result)
        }
      } catch (error) {
        console.error('Error fetching chunk:', error)
        throw error
      }
    }
    
    return { data: allResults }
  } else {
    // Single request
    const body = {
      MetricId: metricId,
      StartDate: formatDateForAPI(start),
      EndDate: formatDateForAPI(end),
      Entity: entity
    }
    
    if (filter && filter.length > 0) {
      body.Filter = filter
    }
    
    return makeRequest('/daily', body)
  }
}

/**
 * Fetches a list from the API
 */
export const fetchList = async (metricId) => {
  const body = {
    MetricId: metricId
  }
  
  return makeRequest('/lists', body)
}
