# Dashboard Mercado de Energía XM

Aplicación web de visualización de métricas del Mercado de Energía Mayorista colombiano, consumiendo datos de la API pública de XM (SINERGOX).

## Descripción

Esta es una **Single Page Application (SPA)** que permite visualizar datos del mercado de energía en tiempo real con 4 paneles principales:

- **Precios**: Precio de bolsa nacional con análisis estadístico
- **Producción**: Top 10 plantas de despacho central
- **Consumo**: Demanda de agentes comercializadores
- **Agua**: Nivel de embalses con indicadores de estado

## Tecnologías Utilizadas

- **Frontend Framework**: React 18.2
- **Bundler**: Vite 5.0
- **Estilos**: Tailwind CSS 3.4
- **Gráficos**: Recharts 2.10
- **Lenguaje**: JavaScript (ES6+)
- **API**: XM SINERGOX (servapibi.xm.com.co)

## Estructura de Carpetas

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx              # Navegación principal
│   │   ├── panels/
│   │   │   ├── PanelPrecios.jsx     # Panel de precios de bolsa
│   │   │   ├── PanelProduccion.jsx  # Panel de top 10 plantas
│   │   │   ├── PanelConsumo.jsx     # Panel de demanda comercial
│   │   │   └── PanelAgua.jsx        # Panel de niveles de embalses
│   │   └── ui/
│   │       ├── Spinner.jsx          # Componente de carga
│   │       ├── ErrorMessage.jsx     # Componente de error
│   │       └── EmptyMessage.jsx     # Componente de sin datos
│   ├── services/
│   │   └── apiXM.js                 # Servicio centralizado de API
│   ├── config/
│   │   └── constants.js             # Constantes y URLs
│   ├── App.jsx                      # Componente principal
│   ├── main.jsx                     # Punto de entrada React
│   └── index.css                    # Estilos globales
├── index.html                       # Punto de entrada HTML
├── package.json                     # Dependencias del proyecto
├── vite.config.js                   # Configuración de Vite
├── tailwind.config.js               # Configuración de Tailwind
└── postcss.config.js                # Configuración de PostCSS
```

## Instalación y Uso

### Requisitos
- Node.js 16 o superior
- npm o yarn

### Pasos para ejecutar en local

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Data-Energy
   ```

2. **Navegar a la carpeta frontend**
   ```bash
   cd frontend
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   - La aplicación se abrirá automáticamente en `http://localhost:5173`
   - Si no se abre, accede manualmente a esa URL

### Comandos disponibles

```bash
npm run dev      # Inicia servidor de desarrollo con live reload
npm run build    # Compila para producción en la carpeta dist/
npm run preview  # Previsualiza la compilación de producción
```

## Características

✅ **4 Paneles Interactivos**
- Visualización de precios horarios de bolsa
- Análisis de generación por plantas
- Demanda de agentes comercializadores
- Niveles de embalses con indicadores de estado

✅ **Responsividad**
- Diseño adaptativo (Desktop, Tablet, Móvil)
- Menú hamburguesa en dispositivos móviles
- Interfaz intuitiva y fácil de usar

✅ **Validaciones**
- Rangos de fechas validados automáticamente
- Límite de 30 días por consulta implementado
- Botones deshabilitados cuando faltan parámetros

✅ **Manejo de Estados**
- Indicadores de carga (Spinner)
- Mensajes de error amigables en español
- Estados vacíos cuando no hay datos

✅ **Integración con API XM**
- Servicio centralizado para llamadas HTTP
- Fragmentación automática de rangos > 30 días
- Manejo de errores sin exponer datos técnicos

## Funcionalidades Detalladas

### Panel de Precios
- Selecciona un día específico
- Visualiza 24 horas de datos horarios
- Calcula estadísticas (mín, Q1, mediana, Q3, máx, media)
- Gráfico de evolución de precios en línea

### Panel de Producción
- Rango de fechas personalizado
- Consulta automática de plantas disponibles
- Filtrado de plantas de Despacho Central
- Ranking de las 10 plantas con mayor generación
- Gráfico de barras comparativo

### Panel de Consumo
- Búsqueda y autocompletado de agentes
- Selección de mes de consulta
- Curva de demanda hora a hora
- Gráfico de línea con datos históricos

### Panel del Agua
- Multiselect de embalses con búsqueda
- Rango de fechas personalizado
- Tabla con niveles de ocupación
- Código de colores por estado:
  - 🔴 Rojo (< 30%): Crítico
  - 🟡 Amarillo (30-60%): Moderado
  - 🟢 Verde (> 60%): Saludable

## API Base

```
https://servapibi.xm.com.co
```

### Endpoints
- `POST /hourly` - Datos por hora
- `POST /daily` - Datos por día
- `POST /lists` - Listados de recursos

## Notas Importantes

- La aplicación **no tiene backend propio**, consume directamente la API pública de XM
- **No requiere autenticación** para acceder a los datos
- Los datos se consultan en **tiempo real** desde el navegador
- La aplicación es **solo lectura**, no modifica datos
- El rango máximo por consulta es **30 días** (se fragmenta automáticamente)

## Licencia

Incluida en el archivo [LICENSE](LICENSE)

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
