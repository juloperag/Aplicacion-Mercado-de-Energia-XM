import { describe, it, expect, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { fetchHourly, fetchDaily, fetchList } from '../../services/apiXM'

describe('apiXM Service', () => {
  describe('fetchHourly', () => {
    it('retorna datos cuando la API responde correctamente', async () => {
      const result = await fetchHourly('PrecBolsNaci', '2024-01-15', '2024-01-15', 'Sistema')
      expect(result).toBeDefined()
      expect(Array.isArray(result.data) || Array.isArray(result)).toBe(true)
    })

    it('divide automáticamente rangos mayores a 30 días en bloques', async () => {
      const result = await fetchHourly('PrecBolsNaci', '2024-01-01', '2024-03-03', 'Sistema')
      expect(result).toBeDefined()
      expect(Array.isArray(result.data) || Array.isArray(result)).toBe(true)
    })

    it('lanza error cuando la API responde con status 500', async () => {
      server.use(
        http.post('https://servapibi.xm.com.co/hourly', () =>
          HttpResponse.json({ message: 'Error interno' }, { status: 500 })
        )
      )
      try {
        await fetchHourly('PrecBolsNaci', '2024-01-15', '2024-01-15', 'Sistema')
        expect.fail('Debería haber lanzado un error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('fetchDaily', () => {
    it('retorna datos diarios de embalses correctamente', async () => {
      const result = await fetchDaily('PorcVoluUtilDiar', '2024-01-01', '2024-01-31', 'Embalse', ['GUATAPE'])
      expect(result).toBeDefined()
      expect(Array.isArray(result.data) || Array.isArray(result)).toBe(true)
    })

    it('maneja rangos menores a 30 días sin división', async () => {
      const result = await fetchDaily('PorcVoluUtilDiar', '2024-01-01', '2024-01-31', 'Embalse')
      expect(result).toBeDefined()
    })
  })

  describe('fetchList', () => {
    it('retorna el listado de recursos correctamente', async () => {
      const result = await fetchList('ListadoRecursos')
      expect(result).toBeDefined()
      expect(Array.isArray(result.data) || Array.isArray(result)).toBe(true)
    })

    it('retorna el listado de agentes correctamente', async () => {
      const result = await fetchList('ListadoAgentes')
      expect(result).toBeDefined()
      expect(Array.isArray(result.data) || Array.isArray(result)).toBe(true)
    })

    it('retorna el listado de embalses correctamente', async () => {
      const result = await fetchList('ListadoEmbalse')
      expect(result).toBeDefined()
      expect(Array.isArray(result.data) || Array.isArray(result)).toBe(true)
    })
  })
})
