# Encuesta de Experiencia · Career Services

Plataforma web interactiva para la recopilación, almacenamiento y análisis estadístico en tiempo real de la encuesta diagnóstica del **Programa de Transición de Carrera**, basada en el diseño metodológico de **Cornerstone International Group Ecuador**.

---

## 🌐 Producción y Acceso

- **URL Pública:** [https://encuesta.nexaflow-ia.com](https://encuesta.nexaflow-ia.com)
- **Servidor:** GCP Compute Engine (`34.122.229.177`)
- **Puerto Interno:** `3004` (Nginx Reverse Proxy con SSL auto-renovable vía Certbot)
- **Gestor de Procesos:** PM2 (`encuesta`)
- **Base de Datos:** SQLite local con modo WAL (`encuesta.db`)

---

## ✨ Características Principales

### 1. Experiencia de Usuario (Participantes)
- **Flujo Wizard Paso a Paso:** Interfaz limpia inspirada en herramientas como Typeform y Tally.
- **Barra de Progreso Dinámica:** Cálculo de completitud visual en tiempo real.
- **Diseño Responsivo & Dark Mode:** Diseñado con micro-animaciones, tipografía moderna (*Plus Jakarta Sans*) y adaptabilidad móvil y de escritorio.
- **Validaciones Rigurosas:** Validación estricta en cada paso (por ejemplo, selección de exactamente 3 prioridades clave en la etapa de objetivos).

### 2. Estructura de la Encuesta
1. **Tu Momento Actual:** Permanencia en el programa y etapa profesional (CV/LinkedIn, búsqueda activa, entrevistas, recolocación/emprendimiento).
2. **Valoración del Programa:** Matriz Likert (1 a 5) en 7 dimensiones (*Frecuencia, Practicidad, Acompañamiento, Contenido, Metodología, Claridad y Continuidad*).
3. **Tus Expectativas:** Objetivos iniciales (múltiples opciones y campo abierto) y nivel de cumplimiento (1 a 5).
4. **Prioridades para la Siguiente Etapa:** Top 3 temas críticos, formatos preferidos y frecuencia deseada para las sesiones.
5. **Recomendación y Mejora:** Net Promoter Score (0 al 10), campos abiertos (*¿Qué mantener?*, *¿Qué mejorar?*, *¿Qué te ayudaría en las próximas 4 semanas?*) y nombre opcional con garantía de confidencialidad.

### 3. Executive Analytics Dashboard (Panel Admin)
Acceso mediante el botón **"Panel Admin"** en la barra superior con clave maestra segura:
- **KPIs Principales:** Conteo total de evaluaciones, cálculo formal del **Net Promoter Score (NPS)** `(% Promotores - % Detractores)` y promedio de cumplimiento de expectativas.
- **Visualización con Chart.js:**
  - *Donut Chart:* Desglose de fidelización NPS (Promotores 9-10, Pasivos 7-8, Detractores 0-6).
  - *Radar Chart:* Matriz visual de 7 dimensiones de satisfacción del programa.
  - *Horizontal Bar Chart:* Frecuencia de las prioridades más demandadas.
  - *Pie Chart:* Distribución por etapa laboral actual.
  - *Vertical Bar Chart:* Frecuencia de expectativas iniciales declaradas.
- **Gestor de Respuestas y Control de Datos:**
  - Buscador predictivo en tiempo real y filtro por etapa laboral.
  - Casillas de verificación individuales y selector maestro (*Select All*).
  - Eliminación individual y eliminación múltiple en lote.
  - Modal **"Ver Ficha"** para inspeccionar las respuestas cualitativas detalladas de cada participante.
  - **Exportación a Excel / CSV:** Descarga con codificación UTF-8 BOM para apertura directa en Microsoft Excel.

---

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js (v20+ / v24+)
- **Backend:** Express.js 4.x
- **Persistencia:** `better-sqlite3` con Write-Ahead Logging (WAL)
- **Frontend:** Vanilla HTML5, CSS3 moderno y Vanilla JavaScript
- **Visualización de Datos:** Chart.js 4.4
- **Infraestructura:** Nginx, Certbot (Let's Encrypt), PM2

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/mlogacho/encuesta.git
cd encuesta/app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
# o para producción:
npm start
```

La aplicación estará disponible en `http://localhost:3004`.

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha del servidor | `3004` |
| `NODE_ENV` | Entorno de ejecución (`production` / `development`) | `production` |
| `ADMIN_PASSWORD` | Contraseña para el Panel Admin | `NexaCareer2026!` |

---

## 🔒 Despliegue en Producción

El servicio corre bajo PM2 en `/home/mlogacho/encuesta`:

```bash
# Sincronizar cambios desde local
rsync -avz --exclude 'node_modules' --exclude '*.db*' -e "ssh -i ~/.ssh/hidroluz_agent" ./app/ mlogacho@34.122.229.177:/home/mlogacho/encuesta/

# Reiniciar servicio en servidor
ssh -i ~/.ssh/hidroluz_agent mlogacho@34.122.229.177 "pm2 restart encuesta"
```
