# 🧪 Plan de Pruebas — Dashboard Mercado de Energía XM
### *Documento orientado a generación y ejecución con GitHub Copilot*

> Cubre pruebas unitarias, de integración y de UI para la SPA construida en React + Vite + Tailwind que consume la API pública de XM.

---

## Stack de Testing

| Herramienta | Propósito | Instalación |
|---|---|---|
| **Vitest** | Test runner principal (nativo en Vite) | `npm install -D vitest` |
| **React Testing Library** | Pruebas de componentes React | `npm install -D @testing-library/react @testing-library/jest-dom` |
| **MSW (Mock Service Worker)** | Interceptar y mockear llamadas a la API XM | `npm install -D msw` |
| **@testing-library/user-event** | Simular interacciones de usuario | `npm install -D @testing-library/user-event` |

### Configuración base en `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
})
```

### Archivo de setup `src/tests/setup.js`

```js
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## Estructura de carpetas de pruebas

```
frontend/
└── src/
    └── tests/
        ├── setup.js
        ├── mocks/
        │   ├── server.js          ← servidor MSW
        │   ├── handlers.js        ← interceptores de la API XM
        │   └── fixtures/
        │       ├── precBolsNaci.json
        │       ├── gene.json
        │       ├── demaCome.json
        │       ├── porcVoluUtilDiar.json
        │       ├── listadoRecursos.json
        │       ├── listadoAgentes.json
        │       └── listadoEmbalse.json
        ├── services/
        │   └── apiXM.test.js
        ├── components/
        │   ├── Sidebar.test.jsx
        │   ├── PanelPrecios.test.jsx
        │   ├── PanelProduccion.test.jsx
        │   ├── PanelConsumo.test.jsx
        │   └── PanelAgua.test.jsx
        └── integration/
            └── navegacion.test.jsx
```

---

## Datos Mock (Fixtures)

> Copilot debe generar estos archivos JSON con datos representativos para usar en los tests.

### `fixtures/precBolsNaci.json`
```json
{
  "Items": [
    { "Date": "2024-01-15", "Hour": 1, "Values": { "Sistema": 450.25 } },
    { "Date": "2024-01-15", "Hour": 2, "Values": { "Sistema": 423.10 } },
    { "Date": "2024-01-15", "Hour": 3, "Values": { "Sistema": 398.75 } }
  ]
}
```

### `fixtures/listadoRecursos.json`
```json
{
  "Items": [
    { "Resource": "TBST", "Name": "TERMODORADA", "DispatchType": "DC", "Agent": "ISAG" },
    { "Resource": "GVIO", "Name": "GUAVIO",      "DispatchType": "DC", "Agent": "EMGR" },
    { "Resource": "EPFV", "Name": "EL PASO",     "DispatchType": "NC", "Agent": "EPSA" }
  ]
}
```

### `fixtures/listadoAgentes.json`
```json
{
  "Items": [
    { "Agent": "EPMC", "Name": "EPM COMERCIALIZACION", "Type": "Comercializador" },
    { "Agent": "ENDG", "Name": "EMGESA",               "Type": "Comercializador" },
    { "Agent": "ISAG", "Name": "ISA",                  "Type": "Generador" }
  ]
}
```

### `fixtures/listadoEmbalse.json`
```json
{
  "Items": [
    { "Name": "GUATAPE" },
    { "Name": "TOPOCORO" },
    { "Name": "PENOL" }
  ]
}
```

---

## Configuración de MSW

### `mocks/handlers.js`
```js
import { http, HttpResponse } from 'msw'
import precBolsNaci     from './fixtures/precBolsNaci.json'
import gene             from './fixtures/gene.json'
import demaCome         from './fixtures/demaCome.json'
import porcVoluUtilDiar from './fixtures/porcVoluUtilDiar.json'
import listadoRecursos  from './fixtures/listadoRecursos.json'
import listadoAgentes   from './fixtures/listadoAgentes.json'
import listadoEmbalse   from './fixtures/listadoEmbalse.json'

const BASE = 'https://servapibi.xm.com.co'

export const handlers = [
  http.post(`${BASE}/hourly`, async ({ request }) => {
    const body = await request.json()
    if (body.MetricId === 'PrecBolsNaci') return HttpResponse.json(precBolsNaci)
    if (body.MetricId === 'Gene')         return HttpResponse.json(gene)
    if (body.MetricId === 'DemaCome')     return HttpResponse.json(demaCome)
    return HttpResponse.json({ Items: [] })
  }),

  http.post(`${BASE}/daily`, async ({ request }) => {
    const body = await request.json()
    if (body.MetricId === 'PorcVoluUtilDiar') return HttpResponse.json(porcVoluUtilDiar)
    return HttpResponse.json({ Items: [] })
  }),

  http.post(`${BASE}/lists`, async ({ request }) => {
    const body = await request.json()
    if (body.MetricId === 'ListadoRecursos') return HttpResponse.json(listadoRecursos)
    if (body.MetricId === 'ListadoAgentes')  return HttpResponse.json(listadoAgentes)
    if (body.MetricId === 'ListadoEmbalse')  return HttpResponse.json(listadoEmbalse)
    return HttpResponse.json({ Items: [] })
  }),
]
```

### `mocks/server.js`
```js
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

---

## 1. Pruebas Unitarias — Servicio `apiXM.js`

**Archivo:** `src/tests/services/apiXM.test.js`

---

### T-U-01 — `fetchHourly` retorna datos correctamente

```js
import { describe, it, expect } from 'vitest'
import { fetchHourly } from '../../services/apiXM'

describe('fetchHourly', () => {
  it('retorna datos cuando la API responde correctamente', async () => {
    const result = await fetchHourly('PrecBolsNaci', '2024-01-15', '2024-01-15', 'Sistema')
    expect(result).toBeDefined()
    expect(Array.isArray(result.Items)).toBe(true)
    expect(result.Items.length).toBeGreaterThan(0)
  })
})
```

---

### T-U-02 — `fetchHourly` divide rangos mayores a 30 días

```js
it('divide automáticamente rangos mayores a 30 días en bloques', async () => {
  // Rango de 62 días → debe hacer 3 llamadas internas
  const result = await fetchHourly('PrecBolsNaci', '2024-01-01', '2024-03-03', 'Sistema')
  expect(result).toBeDefined()
  expect(Array.isArray(result.Items)).toBe(true)
})
```

---

### T-U-03 — `fetchHourly` lanza error cuando la API falla

```js
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

it('lanza error cuando la API responde con status 500', async () => {
  server.use(
    http.post('https://servapibi.xm.com.co/hourly', () =>
      HttpResponse.json({ message: 'Error interno' }, { status: 500 })
    )
  )
  await expect(
    fetchHourly('PrecBolsNaci', '2024-01-15', '2024-01-15', 'Sistema')
  ).rejects.toThrow()
})
```

---

### T-U-04 — `fetchDaily` retorna datos para embalses

```js
import { fetchDaily } from '../../services/apiXM'

it('retorna datos diarios de embalses correctamente', async () => {
  const result = await fetchDaily('PorcVoluUtilDiar', '2024-01-01', '2024-01-31', 'Embalse', ['GUATAPE'])
  expect(result).toBeDefined()
  expect(Array.isArray(result.Items)).toBe(true)
})
```

---

### T-U-05 — `fetchList` retorna listados de apoyo

```js
import { fetchList } from '../../services/apiXM'

it('retorna el listado de recursos correctamente', async () => {
  const result = await fetchList('ListadoRecursos')
  expect(result.Items).toBeDefined()
  expect(result.Items[0]).toHaveProperty('Resource')
  expect(result.Items[0]).toHaveProperty('DispatchType')
})

it('retorna el listado de agentes correctamente', async () => {
  const result = await fetchList('ListadoAgentes')
  expect(result.Items[0]).toHaveProperty('Agent')
  expect(result.Items[0]).toHaveProperty('Type')
})

it('retorna el listado de embalses correctamente', async () => {
  const result = await fetchList('ListadoEmbalse')
  expect(result.Items[0]).toHaveProperty('Name')
})
```

---

## 2. Pruebas Unitarias — Componentes UI

---

### T-U-06 — Sidebar renderiza los 4 paneles

**Archivo:** `src/tests/components/Sidebar.test.jsx`

```js
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../../components/Sidebar'

describe('Sidebar', () => {
  it('muestra los 4 botones de navegación', () => {
    render(<Sidebar activePanel="precios" onSelect={() => {}} />)
    expect(screen.getByText(/precios/i)).toBeInTheDocument()
    expect(screen.getByText(/producción/i)).toBeInTheDocument()
    expect(screen.getByText(/consumo/i)).toBeInTheDocument()
    expect(screen.getByText(/agua/i)).toBeInTheDocument()
  })

  it('marca el panel activo con estilo diferenciado', () => {
    render(<Sidebar activePanel="precios" onSelect={() => {}} />)
    const botonActivo = screen.getByText(/precios/i).closest('button')
    expect(botonActivo).toHaveClass('active') // ajustar al nombre de clase real
  })

  it('llama a onSelect con el panel correcto al hacer click', async () => {
    const onSelect = vi.fn()
    render(<Sidebar activePanel="precios" onSelect={onSelect} />)
    await userEvent.click(screen.getByText(/producción/i))
    expect(onSelect).toHaveBeenCalledWith('produccion')
  })
})
```

---

### T-U-07 — Panel de Precios

**Archivo:** `src/tests/components/PanelPrecios.test.jsx`

```js
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PanelPrecios from '../../components/panels/PanelPrecios'

describe('PanelPrecios', () => {
  it('muestra el date picker al renderizar', () => {
    render(<PanelPrecios />)
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
  })

  it('muestra spinner mientras carga datos', async () => {
    render(<PanelPrecios />)
    const input = screen.getByLabelText(/fecha/i)
    await userEvent.type(input, '2024-01-15')
    expect(screen.getByRole('status')).toBeInTheDocument() // spinner
  })

  it('muestra el precio promedio tras cargar datos', async () => {
    render(<PanelPrecios />)
    const input = screen.getByLabelText(/fecha/i)
    await userEvent.type(input, '2024-01-15')
    await waitFor(() => {
      expect(screen.getByText(/precio promedio/i)).toBeInTheDocument()
    })
  })

  it('muestra el gráfico box plot con datos cargados', async () => {
    render(<PanelPrecios />)
    await waitFor(() => {
      expect(screen.getByRole('img', { name: /box plot/i })).toBeInTheDocument()
    })
  })

  it('muestra mensaje de error amigable si la API falla', async () => {
    server.use(
      http.post('https://servapibi.xm.com.co/hourly', () =>
        HttpResponse.json({}, { status: 500 })
      )
    )
    render(<PanelPrecios />)
    await waitFor(() => {
      expect(screen.getByText(/no pudimos obtener los datos/i)).toBeInTheDocument()
    })
  })
})
```

---

### T-U-08 — Panel de Producción

**Archivo:** `src/tests/components/PanelProduccion.test.jsx`

```js
describe('PanelProduccion', () => {
  it('muestra selectores de rango de fechas', () => {
    render(<PanelProduccion />)
    expect(screen.getByLabelText(/fecha inicio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha fin/i)).toBeInTheDocument()
  })

  it('el botón consultar está deshabilitado si no hay fechas', () => {
    render(<PanelProduccion />)
    expect(screen.getByRole('button', { name: /consultar/i })).toBeDisabled()
  })

  it('muestra el Top 10 de plantas DC en gráfico de barras', async () => {
    render(<PanelProduccion />)
    // Seleccionar fechas y consultar
    await userEvent.type(screen.getByLabelText(/fecha inicio/i), '2024-01-01')
    await userEvent.type(screen.getByLabelText(/fecha fin/i), '2024-01-31')
    await userEvent.click(screen.getByRole('button', { name: /consultar/i }))
    await waitFor(() => {
      expect(screen.getByText(/top 10/i)).toBeInTheDocument()
    })
  })

  it('solo muestra plantas DC en el gráfico (filtra las NC)', async () => {
    render(<PanelProduccion />)
    await waitFor(() => {
      expect(screen.queryByText(/EL PASO/i)).not.toBeInTheDocument() // NC del fixture
      expect(screen.getByText(/GUAVIO/i)).toBeInTheDocument()        // DC del fixture
    })
  })
})
```

---

### T-U-09 — Panel de Consumo

**Archivo:** `src/tests/components/PanelConsumo.test.jsx`

```js
describe('PanelConsumo', () => {
  it('carga y muestra la lista de agentes comercializadores', async () => {
    render(<PanelConsumo />)
    await waitFor(() => {
      expect(screen.getByText(/EPM COMERCIALIZACION/i)).toBeInTheDocument()
      expect(screen.getByText(/EMGESA/i)).toBeInTheDocument()
    })
  })

  it('no muestra agentes que no son comercializadores', async () => {
    render(<PanelConsumo />)
    await waitFor(() => {
      // ISA es Generador en el fixture, no debe aparecer
      expect(screen.queryByText(/^ISA$/i)).not.toBeInTheDocument()
    })
  })

  it('muestra la curva de demanda al seleccionar un agente', async () => {
    render(<PanelConsumo />)
    await waitFor(() => screen.getByText(/EPM/i))
    await userEvent.click(screen.getByText(/EPM/i))
    await waitFor(() => {
      expect(screen.getByRole('img', { name: /demanda/i })).toBeInTheDocument()
    })
  })

  it('permite buscar agentes por texto en el input', async () => {
    render(<PanelConsumo />)
    const input = screen.getByPlaceholderText(/buscar agente/i)
    await userEvent.type(input, 'EPM')
    await waitFor(() => {
      expect(screen.getByText(/EPM COMERCIALIZACION/i)).toBeInTheDocument()
      expect(screen.queryByText(/EMGESA/i)).not.toBeInTheDocument()
    })
  })
})
```

---

### T-U-10 — Panel del Agua

**Archivo:** `src/tests/components/PanelAgua.test.jsx`

```js
describe('PanelAgua', () => {
  it('carga y muestra la lista de embalses disponibles', async () => {
    render(<PanelAgua />)
    await waitFor(() => {
      expect(screen.getByText(/GUATAPE/i)).toBeInTheDocument()
      expect(screen.getByText(/TOPOCORO/i)).toBeInTheDocument()
    })
  })

  it('muestra la tabla con los datos de nivel al consultar', async () => {
    render(<PanelAgua />)
    await waitFor(() => screen.getByText(/GUATAPE/i))
    await userEvent.click(screen.getByText(/GUATAPE/i))
    await userEvent.click(screen.getByRole('button', { name: /consultar/i }))
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('aplica color rojo si el nivel es menor al 30%', async () => {
    // El fixture debe incluir una fila con nivel < 30
    render(<PanelAgua />)
    await waitFor(() => {
      const filaRoja = screen.getByTestId('fila-nivel-critico')
      expect(filaRoja).toHaveStyle({ backgroundColor: '#fee2e2' })
    })
  })

  it('aplica color amarillo si el nivel está entre 30% y 60%', async () => {
    render(<PanelAgua />)
    await waitFor(() => {
      const filaAmarilla = screen.getByTestId('fila-nivel-medio')
      expect(filaAmarilla).toHaveStyle({ backgroundColor: '#fef9c3' })
    })
  })

  it('aplica color verde si el nivel supera el 60%', async () => {
    render(<PanelAgua />)
    await waitFor(() => {
      const filaVerde = screen.getByTestId('fila-nivel-ok')
      expect(filaVerde).toHaveStyle({ backgroundColor: '#dcfce7' })
    })
  })
})
```

---

## 3. Pruebas de Integración — Navegación SPA

**Archivo:** `src/tests/integration/navegacion.test.jsx`

---

### T-I-01 — Navegación entre paneles sin reload

```js
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

describe('Navegación SPA', () => {
  it('muestra el Panel de Precios por defecto al cargar', () => {
    render(<App />)
    expect(screen.getByText(/precio de bolsa/i)).toBeInTheDocument()
  })

  it('navega al Panel de Producción al hacer click en el botón', async () => {
    render(<App />)
    await userEvent.click(screen.getByText(/producción/i))
    expect(screen.getByText(/top 10 plantas/i)).toBeInTheDocument()
    expect(screen.queryByText(/precio de bolsa/i)).not.toBeInTheDocument()
  })

  it('navega al Panel de Consumo correctamente', async () => {
    render(<App />)
    await userEvent.click(screen.getByText(/consumo/i))
    expect(screen.getByText(/demanda comercial/i)).toBeInTheDocument()
  })

  it('navega al Panel del Agua correctamente', async () => {
    render(<App />)
    await userEvent.click(screen.getByText(/agua/i))
    expect(screen.getByText(/nivel de embalses/i)).toBeInTheDocument()
  })
})
```

---

### T-I-02 — Validación de fechas cruzada

```js
describe('Validación de formularios', () => {
  it('deshabilita el botón si fecha inicio es posterior a fecha fin', async () => {
    render(<App />)
    await userEvent.click(screen.getByText(/producción/i))
    await userEvent.type(screen.getByLabelText(/fecha inicio/i), '2024-03-01')
    await userEvent.type(screen.getByLabelText(/fecha fin/i), '2024-01-01')
    expect(screen.getByRole('button', { name: /consultar/i })).toBeDisabled()
  })

  it('muestra mensaje de advertencia si las fechas son inválidas', async () => {
    render(<App />)
    await userEvent.click(screen.getByText(/producción/i))
    await userEvent.type(screen.getByLabelText(/fecha inicio/i), '2024-03-01')
    await userEvent.type(screen.getByLabelText(/fecha fin/i), '2024-01-01')
    expect(screen.getByText(/fecha inicio no puede ser posterior/i)).toBeInTheDocument()
  })
})
```

---

### T-I-03 — Estado de vacío (API retorna Items: [])

```js
it('muestra mensaje de vacío si la API no retorna datos', async () => {
  server.use(
    http.post('https://servapibi.xm.com.co/hourly', () =>
      HttpResponse.json({ Items: [] })
    )
  )
  render(<App />)
  await userEvent.type(screen.getByLabelText(/fecha/i), '2024-01-15')
  await waitFor(() => {
    expect(
      screen.getByText(/no hay datos disponibles para el período seleccionado/i)
    ).toBeInTheDocument()
  })
})
```

---

## 4. Pruebas de Regresión — Casos Límite

| ID | Escenario | Resultado esperado |
|---|---|---|
| T-R-01 | Rango de exactamente 30 días | Una sola llamada a la API, sin división |
| T-R-02 | Rango de 31 días | División en dos bloques (30 + 1 día) |
| T-R-03 | Rango de 90 días | División en tres bloques de 30 días |
| T-R-04 | API responde en más de 5 segundos | Spinner visible, sin pantalla en blanco |
| T-R-05 | API responde con status 404 | Mensaje de error amigable, sin crash |
| T-R-06 | API responde con status 500 | Mensaje de error amigable, sin crash |
| T-R-07 | Sin selección de agente en Panel Consumo | Botón consultar deshabilitado |
| T-R-08 | Sin selección de embalse en Panel Agua | Botón consultar deshabilitado |
| T-R-09 | Embalse con nivel exactamente 30% | Clasificado como amarillo (≥ 30%) |
| T-R-10 | Embalse con nivel exactamente 60% | Clasificado como verde (> 60%) |

---

## 5. Comandos para Ejecutar los Tests

```bash
# Correr todos los tests
npm run test

# Correr tests en modo watch (re-ejecuta al guardar)
npm run test -- --watch

# Ver reporte de cobertura
npm run test -- --coverage

# Correr solo un archivo de tests
npm run test -- src/tests/services/apiXM.test.js

# Correr solo tests que coincidan con un nombre
npm run test -- -t "divide automáticamente"
```

### Script en `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 6. Criterios de Aceptación

| Cobertura mínima | Valor |
|---|---|
| Servicio `apiXM.js` | 90% |
| Componentes de paneles | 70% |
| Integración de navegación | 80% |
| **Total del proyecto** | **≥ 75%** |

Un pull request o entrega se considera **apta** cuando:
- ✅ Todos los tests pasan sin errores (`npm run test` en verde)
- ✅ La cobertura total supera el 75%
- ✅ No hay tests con `skip` o `todo` sin justificación
- ✅ Los mocks de MSW no hacen llamadas reales a la API de XM

---

*Documento de plan de pruebas — Reto Desarrollador Junior XM.*
