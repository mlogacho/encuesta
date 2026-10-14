const express = require('express');
const path = require('path');
const { guardarRespuesta, obtenerTodas, obtenerAnaliticaCompleta, eliminarEncuestas } = require('./db');

const app = express();
const PORT = process.env.PORT || 3004;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'NexaCareer2026!';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Headers de seguridad básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'encuesta-career-services', timestamp: new Date().toISOString() });
});

// Guardar respuesta de la encuesta
app.post('/api/encuestas', (req, res) => {
  try {
    const ip_origen = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const user_agent = req.headers['user-agent'] || '';
    
    const datos = {
      ...req.body,
      ip_origen,
      user_agent
    };

    const resultado = guardarRespuesta(datos);
    return res.status(201).json({
      success: true,
      id: resultado.lastInsertRowid,
      mensaje: '¡Encuesta registrada con éxito!'
    });
  } catch (error) {
    console.error('Error al guardar encuesta:', error);
    return res.status(500).json({ success: false, error: 'Error interno al registrar la encuesta' });
  }
});

// Middleware simple de autenticación para panel admin
function checkAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }
  next();
}

// Login admin
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
});

// Listar respuestas (Admin)
app.get('/api/admin/respuestas', checkAdminAuth, (req, res) => {
  try {
    const respuestas = obtenerTodas();
    const analitica = obtenerAnaliticaCompleta();
    res.json({ success: true, analitica, stats: { total: analitica.total, npsScore: analitica.nps.score, cumplimientoPromedio: analitica.cumplimiento.promedio }, respuestas });
  } catch (error) {
    console.error('Error admin respuestas:', error);
    res.status(500).json({ success: false, error: 'Error al consultar respuestas' });
  }
});

// Eliminar una o varias encuestas (Admin)
app.delete('/api/admin/encuestas', checkAdminAuth, (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Lista de IDs no válida' });
    }
    const eliminados = eliminarEncuestas(ids);
    res.json({ success: true, eliminados, mensaje: `${eliminados} encuesta(s) eliminada(s) correctamente` });
  } catch (error) {
    console.error('Error eliminando encuestas:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar encuestas' });
  }
});

// Exportar CSV (Admin)
app.get('/api/admin/export.csv', checkAdminAuth, (req, res) => {
  try {
    const respuestas = obtenerTodas();
    const headers = [
      'ID', 'Fecha', 'Nombre (Opcional)', 'Tiempo en Programa', 'Etapa Actual',
      'Frecuencia (1-5)', 'Practicidad (1-5)', 'Acompañamiento (1-5)', 'Contenido (1-5)',
      'Metodología (1-5)', 'Claridad (1-5)', 'Continuidad (1-5)',
      'Expectativas Iniciales', 'Expectativa Otro', 'Cumplimiento Expectativas (1-5)',
      'Top 3 Prioridades', 'Formato Preferido', 'Frecuencia Preferida', 'NPS (0-10)',
      'Qué Mantener', 'Qué Mejorar', 'Qué Ayudaría Próximas 4 Semanas'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.map(escapeCsv).join(',')];

    for (const r of respuestas) {
      const v = r.valoraciones || {};
      const row = [
        r.id,
        r.fecha_registro,
        r.nombre_opcional || 'Anónimo',
        r.tiempo_programa || '',
        r.etapa_actual || '',
        v['frecuencia'] || '',
        v['practicidad'] || '',
        v['acompanamiento'] || '',
        v['contenido'] || '',
        v['metodologia'] || '',
        v['claridad'] || '',
        v['continuidad'] || '',
        (r.expectativas_iniciales || []).join('; '),
        r.expectativas_otro || '',
        r.cumplimiento_expectativas || '',
        (r.prioridades_siguiente_etapa || []).join('; '),
        (r.formato_preferido || []).join('; '),
        r.frecuencia_sesiones || '',
        r.nps_recomendacion !== null ? r.nps_recomendacion : '',
        r.mantener_programa || '',
        r.mejorar_programa || '',
        r.ayuda_proximas_semanas || ''
      ];
      csvRows.push(row.map(escapeCsv).join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="encuestas_career_services_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send('\uFEFF' + csvRows.join('\r\n')); // BOM UTF-8 para Excel
  } catch (error) {
    console.error('Error export CSV:', error);
    res.status(500).send('Error exportando CSV');
  }
});

// Fallback a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Encuesta Career Services] Servidor activo en http://0.0.0.0:${PORT}`);
});
