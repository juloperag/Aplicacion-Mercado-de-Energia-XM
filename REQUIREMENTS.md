# 📋 Especificación de Requerimientos — Dashboard Mercado de Energía XM
### *Documento optimizado para generación con GitHub Copilot (Claude Opus)*

> Este documento sirve como contexto completo para que Copilot genere la aplicación. Cada requerimiento está redactado de forma imperativa y específica para minimizar ambigüedad durante la generación de código.

---

## Contexto del Proyecto

Construir una **Single Page Application (SPA)** que consuma la API pública de XM (SINERGOX) para visualizar datos del Mercado de Energía Mayorista colombiano. La aplicación vive en la carpeta `/frontend` del repositorio y corre exclusivamente en **local** (`npm run dev`). No hay backend propio.

**API base:** `https://servapibi.xm.com.co`
**Método:** `POST` en todos los endpoints
**No requiere autenticación ni API key**

---

## 1. Requerimientos Funcionales

> Instrucciones directas de lo que Copilot debe implementar.

---

### RF-01 — Estructura y navegación SPA

```
Genera una SPA con:
- Sidebar fijo a la izquierda con 4 botones de navegación
- El contenido principal cambia según el panel activo (sin reload)
- El botón activo debe tener estilo visual diferenciado
- En móvil, el sidebar se convierte en menú hamburguesa
```

Los 4 paneles son:
1. Panel de Precios
2. Panel de Producción
3. Panel de Consumo
4. Panel del Agua

---

### RF-02 — Servicio centralizado de la API XM

```
Crea un módulo en src/services/apiXM.js con las siguientes funciones:

- fetchHourly(metricId, startDate, endDate, entity, filter?)
  → POST https://servapibi.xm.com.co/hourly

- fetchDaily(metricId, startDate, endDate, entity, filter?)
  → POST https://servapibi.xm.com.co/daily

- fetchList(metricId)
  → POST https://servapibi.xm.com.co/lists

Body estándar:
{
  "MetricId": metricId,
  "StartDate": "YYYY-MM-DD",
  "EndDate": "YYYY-MM-DD",
  "Entity": entity,
  "Filter": [array de códigos, opcional]
}

Regla crítica: si el rango de fechas supera 30 días en fetchHourly o fetchDaily,
dividir automáticamente en bloques de 30 días, ejecutar cada llamada en secuencia
y concatenar los resultados antes de retornar.
```

---

### RF-03 — Panel de Precios: Precio de Bolsa Nacional

```
MetricId: PrecBolsNaci
Endpoint: /hourly
Entity: Sistema
Sin filtros

Implementar:
1. Date picker para seleccionar un día
2. Al seleccionar la fecha, consultar las 24 horas de ese día
3. Renderizar un box plot con la distribución de precios de las 24 horas
4. Calcular y mostrar el Precio de Bolsa Promedio del día (media aritmética)
5. Mostrar spinner mientras carga y mensaje de error si falla
```

---

### RF-04 — Panel de Producción: Top 10 Plantas DC

```
MetricId datos: Gene
Endpoint datos: /hourly
Entity: Recurso

MetricId listado: ListadoRecursos
Endpoint listado: /lists

Implementar:
1. Selector de rango de fechas (fecha inicio y fecha fin)
2. Al montar el componente, consultar ListadoRecursos para obtener
   el listado completo de plantas y su atributo de despacho central (DC)
3. Al consultar, traer Gene para el rango seleccionado por Recurso
4. Sumar la generación total por planta en todo el rango
5. Filtrar solo las plantas cuyo atributo indique que son DC
6. Ordenar de mayor a menor y tomar las primeras 10
7. Renderizar gráfico de barras con el Top 10
8. Mostrar spinner mientras carga y mensaje de error si falla
```

---

### RF-05 — Panel de Consumo: Demanda por Agente Comercializador

```
MetricId datos: DemaCome
Endpoint datos: /hourly
Entity: Agente

MetricId listado: ListadoAgentes
Endpoint listado: /lists

Implementar:
1. Al montar el componente, consultar ListadoAgentes para poblar el selector
2. Input con autocompletado/búsqueda para seleccionar un agente comercializador
3. Date picker para seleccionar el mes de consulta (mes + año)
4. Al seleccionar agente y mes, consultar DemaCome por ese agente durante 1 mes
5. Renderizar gráfico de línea con la curva de demanda hora a hora
6. Mostrar spinner mientras carga y mensaje de error si falla
```

---

### RF-06 — Panel del Agua: Nivel de Embalses

```
MetricId datos: PorcVoluUtilDiar
Endpoint datos: /daily
Entity: Embalse

MetricId listado: ListadoEmbalse
Endpoint listado: /lists

Implementar:
1. Al montar el componente, consultar ListadoEmbalse para poblar el selector
2. Selector múltiple de embalses (multiselect con búsqueda)
3. Selector de rango de fechas
4. Al confirmar la selección, consultar PorcVoluUtilDiar para los embalses elegidos
5. Renderizar tabla con columnas: Fecha | Embalse | Nivel (%)
6. Aplicar color de fondo a la fila según el nivel:
   - Rojo (#fee2e2)   → nivel < 30%
   - Amarillo (#fef9c3) → nivel entre 30% y 60%
   - Verde (#dcfce7)  → nivel > 60%
7. Mostrar spinner mientras carga y mensaje de error si falla
```

---

### RF-07 — Estados de UI globales

```
Para todos los paneles implementar los 3 estados:
- Loading: spinner centrado mientras se espera respuesta de la API
- Error: mensaje amigable en español, sin stack trace ni detalles técnicos
  Ejemplo: "No pudimos obtener los datos. Intenta de nuevo más tarde."
- Empty: mensaje cuando la API responde vacío
  Ejemplo: "No hay datos disponibles para el período seleccionado."
```

---

## 2. Requerimientos No Funcionales

> Restricciones de calidad que Copilot debe respetar en todo el código generado.

---

### RNF-01 — Stack tecnológico

```
- Framework: React (con Vite como bundler)
- Lenguaje: JavaScript (no TypeScript)
- Estilos: Tailwind CSS
- Gráficos: Recharts (ya incluida en proyectos Lovable/React estándar)
- El proyecto vive en la carpeta /frontend del repositorio
- Comando de inicio: npm install && npm run dev
```

---

### RNF-02 — Organización del código

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── panels/
│   │   │   ├── PanelPrecios.jsx
│   │   │   ├── PanelProduccion.jsx
│   │   │   ├── PanelConsumo.jsx
│   │   │   └── PanelAgua.jsx
│   │   └── ui/
│   │       ├── Spinner.jsx
│   │       ├── ErrorMessage.jsx
│   │       └── EmptyMessage.jsx
│   ├── services/
│   │   └── apiXM.js        ← todas las llamadas HTTP aquí
│   ├── config/
│   │   └── constants.js    ← URLs base y MetricIds
│   └── App.jsx
```

---

### RNF-03 — Responsividad

```
- Desktop (≥ 1024px): sidebar fijo visible, contenido al lado derecho
- Tablet (768px – 1023px): sidebar colapsable
- Móvil (< 768px): menú hamburguesa, sidebar como drawer
Usar clases responsive de Tailwind (sm:, md:, lg:)
```

---

### RNF-04 — Validaciones de formulario

```
- La fecha de inicio nunca puede ser posterior a la fecha de fin
- Si el usuario no ha seleccionado los campos requeridos, el botón
  de consulta debe estar deshabilitado (disabled + estilo opaco)
- El selector de agente/embalse debe tener búsqueda por texto
```

---

### RNF-05 — Gráficos

```
- Todos los gráficos deben tener: título, etiquetas en los ejes y tooltip al hover
- El box plot puede implementarse con una librería auxiliar compatible con React
  o construirse manualmente con SVG si Recharts no lo soporta nativamente
- Los colores de los gráficos deben ser consistentes con la paleta de Tailwind
```

---

### RNF-06 — Sin datos sensibles en el código

```
- No hardcodear URLs distintas a las de la API pública de XM
- No incluir claves, tokens ni credenciales (la API no las requiere)
- No usar localStorage para guardar datos de consulta
```

---

### RNF-07 — README obligatorio

```
El archivo README.md en la raíz del repositorio debe incluir:
1. Nombre del proyecto y descripción
2. Tecnologías usadas
3. Estructura de carpetas (mencionando /frontend)
4. Pasos para correr en local:
   - git clone <url>
   - cd frontend
   - npm install
   - npm run dev
5. Enlace al despliegue (si aplica)
```

---

## 3. Lo que NO Debe Ocurrir

> Restricciones explícitas que Copilot no debe violar bajo ningún contexto.

---

### NSD-01 — Sin backend propio
No crear ningún servidor Express, FastAPI, Flask ni similar. El frontend llama directamente a `servapibi.xm.com.co` desde el navegador.

---

### NSD-02 — Sin TypeScript
No usar `.ts` ni `.tsx`. Todo el código en `.js` y `.jsx` estándar.

---

### NSD-03 — Sin llamadas a la API dispersas en componentes
Todas las llamadas HTTP deben estar en `src/services/apiXM.js`. Los componentes solo llaman a las funciones de ese servicio, nunca usan `fetch` o `axios` directamente.

---

### NSD-04 — Sin errores crudos expuestos al usuario
Nunca mostrar en pantalla: stack traces, mensajes de error HTTP en inglés, códigos de estado (404, 500), ni respuestas JSON crudas de la API.

---

### NSD-05 — Sin peticiones que ignoren el límite de 30 días
No enviar una sola petición a la API con un rango mayor a 30 días. La función `fetchHourly` y `fetchDaily` deben partir el rango automáticamente en bloques válidos.

---

### NSD-06 — Sin librerías de pago ni con licencia comercial restrictiva
Usar únicamente librerías open source (MIT, Apache 2.0). No integrar servicios de terceros que requieran cuenta o suscripción.

---

### NSD-07 — Sin commits masivos
El historial de Git no debe tener un único commit con todo el proyecto. Los commits deben ser incrementales y seguir la convención:
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `chore:` configuración o setup
- `docs:` documentación

---

### NSD-08 — Sin modificación de datos
La aplicación es solo de lectura y visualización. No implementar ningún formulario, botón ni acción que intente escribir, editar o eliminar datos en la API.

---

## 4. Referencia rápida para Copilot

### Endpoints

| Periodicidad | URL |
|---|---|
| Horaria | `https://servapibi.xm.com.co/hourly` |
| Diaria | `https://servapibi.xm.com.co/daily` |
| Listados | `https://servapibi.xm.com.co/lists` |

### Métricas por panel

| Panel | MetricId | Entity | Endpoint |
|---|---|---|---|
| Precios | `PrecBolsNaci` | `Sistema` | `/hourly` |
| Producción | `Gene` | `Recurso` | `/hourly` |
| Consumo | `DemaCome` | `Agente` | `/hourly` |
| Agua | `PorcVoluUtilDiar` | `Embalse` | `/daily` |

### Listados de apoyo

| Listado | MetricId | Endpoint |
|---|---|---|
| Plantas | `ListadoRecursos` | `/lists` |
| Agentes | `ListadoAgentes` | `/lists` |
| Embalses | `ListadoEmbalse` | `/lists` |

### Formato del body

```json
{
  "MetricId": "PrecBolsNaci",
  "StartDate": "2024-01-01",
  "EndDate": "2024-01-31",
  "Entity": "Sistema",
  "Filter": []
}
```

> `Filter` es opcional y solo aplica cuando `Entity` no es `Sistema`.

---

*Documento de referencia para generación asistida con GitHub Copilot — Reto Desarrollador Junior XM.*
