# Changelog

Todas las modificaciones notables de este proyecto están documentadas en este archivo según el estándar [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [1.2.0] - 2026-10-13

### Añadido
- **Gestión y Eliminación de Encuestas:**
  - Casillas de selección (checkboxes) individuales por fila en la tabla del panel administrativo.
  - Checkbox maestro en el encabezado de la tabla para seleccionar/deseleccionar todas las respuestas visibles simultáneamente.
  - Botón de eliminación individual por fila junto al modal de "Ver Ficha".
  - Botón de eliminación en lote `Eliminar (N)` que aparece de forma dinámica al seleccionar una o más encuestas.
  - Endpoint seguro en el backend: `DELETE /api/admin/encuestas` con soporte para listas de identificadores en una sola transacción.
  - Recálculo automático instantáneo de todas las métricas de Chart.js y estadísticas tras eliminar registros.

---

## [1.1.0] - 2026-10-13

### Añadido
- **Executive Analytics Dashboard:**
  - Integración de la librería **Chart.js 4.4**.
  - Cálculo oficial de **Net Promoter Score (NPS)** diferenciando Promotores (9-10), Pasivos (7-8) y Detractores (0-6).
  - Donut Chart para visualizar el desglose porcentual de fidelización NPS.
  - Radar Chart para las 7 dimensiones clave de valoración del programa (Frecuencia, Practicidad, Acompañamiento, Contenido, Metodología, Claridad y Continuidad).
  - Horizontal Bar Chart con el ranking de los 3 temas prioritarios más demandados.
  - Pie Chart con la distribución de los participantes por etapa profesional.
  - Vertical Bar Chart con la frecuencia de las expectativas iniciales declaradas.
- **Filtros y Explorador Cualitativo:**
  - Buscador predictivo en tiempo real por nombre o contenido de texto.
  - Filtro selectivo por etapa laboral.
  - Modal interactivo "Ver Ficha" con el desglose de preguntas abiertas cualitativas (*Qué mantener*, *Qué mejorar*, *Apoyo próximas semanas*).

---

## [1.0.0] - 2026-10-12

### Añadido
- **Lanzamiento Inicial de la Aplicación:**
  - Implementación web de la encuesta estructurada en [Encuesta_CareerServices_GoogleForms.gs](file:///Users/marcologacho/Documents/Encuesta/Encuesta_CareerServices_GoogleForms.gs).
  - Interfaz interactiva tipo Wizard con transiciones fluidas y barra de progreso.
  - Backend con Express.js y base de datos SQLite persistente con soporte WAL (`better-sqlite3`).
  - Panel administrativo protegido por clave maestra (`NexaCareer2026!`).
  - Exportación de respuestas a archivo Excel / CSV con codificación UTF-8 BOM.
  - Despliegue en producción bajo el subdominio `https://encuesta.nexaflow-ia.com` en puerto interno `3004` con proxy inverso Nginx y certificado SSL Let's Encrypt (Certbot).
