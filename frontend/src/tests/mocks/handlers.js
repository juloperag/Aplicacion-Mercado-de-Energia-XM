import { http, HttpResponse } from 'msw'
import precBolsNaci from './fixtures/precBolsNaci.json'
import gene from './fixtures/gene.json'
import demaCome from './fixtures/demaCome.json'
import porcVoluUtilDiar from './fixtures/porcVoluUtilDiar.json'
import listadoRecursos from './fixtures/listadoRecursos.json'
import listadoAgentes from './fixtures/listadoAgentes.json'
import listadoEmbalse from './fixtures/listadoEmbalse.json'

const BASE = 'https://servapibi.xm.com.co'

export const handlers = [
  http.post(`${BASE}/hourly`, async ({ request }) => {
    const body = await request.json()
    if (body.MetricId === 'PrecBolsNaci') return HttpResponse.json(precBolsNaci)
    if (body.MetricId === 'Gene') return HttpResponse.json(gene)
    if (body.MetricId === 'DemaCome') return HttpResponse.json(demaCome)
    return HttpResponse.json({ data: [] })
  }),

  http.post(`${BASE}/daily`, async ({ request }) => {
    const body = await request.json()
    if (body.MetricId === 'PorcVoluUtilDiar') return HttpResponse.json(porcVoluUtilDiar)
    return HttpResponse.json({ data: [] })
  }),

  http.post(`${BASE}/lists`, async ({ request }) => {
    const body = await request.json()
    if (body.MetricId === 'ListadoRecursos') return HttpResponse.json(listadoRecursos)
    if (body.MetricId === 'ListadoAgentes') return HttpResponse.json(listadoAgentes)
    if (body.MetricId === 'ListadoEmbalse') return HttpResponse.json(listadoEmbalse)
    return HttpResponse.json({ data: [] })
  }),
]
