const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'encuesta.db');
const db = new Database(dbPath);

// Activar WAL mode para alta concurrencia y mejor rendimiento
db.pragma('journal_mode = WAL');

// Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS encuestas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    tiempo_programa TEXT,
    etapa_actual TEXT,
    valoraciones TEXT, -- JSON con las 7 métricas del 1 al 5
    expectativas_iniciales TEXT, -- JSON array
    expectativas_otro TEXT,
    cumplimiento_expectativas INTEGER, -- 1 al 5
    prioridades_siguiente_etapa TEXT, -- JSON array (3 temas seleccionados)
    formato_preferido TEXT, -- JSON array
    frecuencia_sesiones TEXT,
    nps_recomendacion INTEGER, -- 0 al 10
    mantener_programa TEXT,
    mejorar_programa TEXT,
    ayuda_proximas_semanas TEXT,
    nombre_opcional TEXT,
    ip_origen TEXT,
    user_agent TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_fecha_registro ON encuestas(fecha_registro);
`);

function guardarRespuesta(datos) {
  const stmt = db.prepare(`
    INSERT INTO encuestas (
      tiempo_programa,
      etapa_actual,
      valoraciones,
      expectativas_iniciales,
      expectativas_otro,
      cumplimiento_expectativas,
      prioridades_siguiente_etapa,
      formato_preferido,
      frecuencia_sesiones,
      nps_recomendacion,
      mantener_programa,
      mejorar_programa,
      ayuda_proximas_semanas,
      nombre_opcional,
      ip_origen,
      user_agent
    ) VALUES (
      @tiempo_programa,
      @etapa_actual,
      @valoraciones,
      @expectativas_iniciales,
      @expectativas_otro,
      @cumplimiento_expectativas,
      @prioridades_siguiente_etapa,
      @formato_preferido,
      @frecuencia_sesiones,
      @nps_recomendacion,
      @mantener_programa,
      @mejorar_programa,
      @ayuda_proximas_semanas,
      @nombre_opcional,
      @ip_origen,
      @user_agent
    )
  `);

  return stmt.run({
    tiempo_programa: datos.tiempo_programa || null,
    etapa_actual: datos.etapa_actual || null,
    valoraciones: JSON.stringify(datos.valoraciones || {}),
    expectativas_iniciales: JSON.stringify(datos.expectativas_iniciales || []),
    expectativas_otro: datos.expectativas_otro || null,
    cumplimiento_expectativas: datos.cumplimiento_expectativas ? parseInt(datos.cumplimiento_expectativas) : null,
    prioridades_siguiente_etapa: JSON.stringify(datos.prioridades_siguiente_etapa || []),
    formato_preferido: JSON.stringify(datos.formato_preferido || []),
    frecuencia_sesiones: datos.frecuencia_sesiones || null,
    nps_recomendacion: datos.nps_recomendacion !== undefined ? parseInt(datos.nps_recomendacion) : null,
    mantener_programa: datos.mantener_programa || null,
    mejorar_programa: datos.mejorar_programa || null,
    ayuda_proximas_semanas: datos.ayuda_proximas_semanas || null,
    nombre_opcional: datos.nombre_opcional || null,
    ip_origen: datos.ip_origen || null,
    user_agent: datos.user_agent || null
  });
}

function parseRow(r) {
  return {
    ...r,
    valoraciones: r.valoraciones ? JSON.parse(r.valoraciones) : {},
    expectativas_iniciales: r.expectativas_iniciales ? JSON.parse(r.expectativas_iniciales) : [],
    prioridades_siguiente_etapa: r.prioridades_siguiente_etapa ? JSON.parse(r.prioridades_siguiente_etapa) : [],
    formato_preferido: r.formato_preferido ? JSON.parse(r.formato_preferido) : []
  };
}

function obtenerTodas() {
  const rows = db.prepare('SELECT * FROM encuestas ORDER BY id DESC').all();
  return rows.map(parseRow);
}

function obtenerAnaliticaCompleta() {
  const total = db.prepare('SELECT COUNT(*) as count FROM encuestas').get().count;
  if (total === 0) {
    return {
      total: 0,
      nps: { score: 0, promotores: 0, pasivos: 0, detractores: 0, promotoresPct: 0, pasivosPct: 0, detractoresPct: 0, totalValidos: 0 },
      cumplimiento: { promedio: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      valoracionesRadar: {},
      prioridadesTop: {},
      etapasDistribucion: {},
      tiemposDistribucion: {},
      formatosDistribucion: {},
      frecuenciasDistribucion: {},
      expectativasFrecuencia: {}
    };
  }

  const rows = obtenerTodas();

  // 1. NPS Oficial: Detractores (0-6), Pasivos (7-8), Promotores (9-10)
  let promotores = 0;
  let pasivos = 0;
  let detractores = 0;
  let totalNps = 0;

  // 2. Cumplimiento
  let sumaCumplimiento = 0;
  let totalCumplimiento = 0;
  const distCumplimiento = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // 3. Valoraciones Likert Radar (7 métricas)
  const sumaLikert = {
    frecuencia: 0,
    practicidad: 0,
    acompanamiento: 0,
    contenido: 0,
    metodologia: 0,
    claridad: 0,
    continuidad: 0
  };
  const countLikert = { ...sumaLikert };

  // 4. Conteo de categorías
  const prioridadesMap = {};
  const etapasMap = {};
  const tiemposMap = {};
  const formatosMap = {};
  const frecuenciasMap = {};
  const expectativasMap = {};

  for (const r of rows) {
    // NPS
    if (r.nps_recomendacion !== null && r.nps_recomendacion !== undefined) {
      const score = Number(r.nps_recomendacion);
      totalNps++;
      if (score >= 9) promotores++;
      else if (score >= 7) pasivos++;
      else detractores++;
    }

    // Cumplimiento
    if (r.cumplimiento_expectativas) {
      const val = Number(r.cumplimiento_expectativas);
      sumaCumplimiento += val;
      totalCumplimiento++;
      if (distCumplimiento[val] !== undefined) distCumplimiento[val]++;
    }

    // Valoraciones Likert
    if (r.valoraciones) {
      for (const [key, val] of Object.entries(r.valoraciones)) {
        if (sumaLikert[key] !== undefined && val) {
          sumaLikert[key] += Number(val);
          countLikert[key]++;
        }
      }
    }

    // Etapas
    if (r.etapa_actual) {
      etapasMap[r.etapa_actual] = (etapasMap[r.etapa_actual] || 0) + 1;
    }

    // Tiempos
    if (r.tiempo_programa) {
      tiemposMap[r.tiempo_programa] = (tiemposMap[r.tiempo_programa] || 0) + 1;
    }

    // Frecuencias preferidas
    if (r.frecuencia_sesiones) {
      frecuenciasMap[r.frecuencia_sesiones] = (frecuenciasMap[r.frecuencia_sesiones] || 0) + 1;
    }

    // Prioridades Top
    if (Array.isArray(r.prioridades_siguiente_etapa)) {
      for (const p of r.prioridades_siguiente_etapa) {
        prioridadesMap[p] = (prioridadesMap[p] || 0) + 1;
      }
    }

    // Formato
    if (Array.isArray(r.formato_preferido)) {
      for (const f of r.formato_preferido) {
        formatosMap[f] = (formatosMap[f] || 0) + 1;
      }
    }

    // Expectativas
    if (Array.isArray(r.expectativas_iniciales)) {
      for (const exp of r.expectativas_iniciales) {
        expectativasMap[exp] = (expectativasMap[exp] || 0) + 1;
      }
    }
  }

  // NPS Score = % Promotores - % Detractores
  const promPct = totalNps > 0 ? (promotores / totalNps) * 100 : 0;
  const pasPct = totalNps > 0 ? (pasivos / totalNps) * 100 : 0;
  const detPct = totalNps > 0 ? (detractores / totalNps) * 100 : 0;
  const npsScore = Math.round(promPct - detPct);

  // Radar promedios
  const radarPromedios = {};
  for (const k of Object.keys(sumaLikert)) {
    radarPromedios[k] = countLikert[k] > 0 ? Number((sumaLikert[k] / countLikert[k]).toFixed(2)) : 0;
  }

  return {
    total,
    nps: {
      score: npsScore,
      promotores,
      pasivos,
      detractores,
      promotoresPct: Math.round(promPct),
      pasivosPct: Math.round(pasPct),
      detractoresPct: Math.round(detPct),
      totalValidos: totalNps
    },
    cumplimiento: {
      promedio: totalCumplimiento > 0 ? Number((sumaCumplimiento / totalCumplimiento).toFixed(2)) : 0,
      distribucion: distCumplimiento
    },
    valoracionesRadar: radarPromedios,
    prioridadesTop: prioridadesMap,
    etapasDistribucion: etapasMap,
    tiemposDistribucion: tiemposMap,
    formatosDistribucion: formatosMap,
    frecuenciasDistribucion: frecuenciasMap,
    expectativasFrecuencia: expectativasMap
  };
}

function eliminarEncuestas(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM encuestas WHERE id IN (${placeholders})`);
  const info = stmt.run(...ids);
  return info.changes;
}

module.exports = {
  db,
  guardarRespuesta,
  obtenerTodas,
  obtenerAnaliticaCompleta,
  eliminarEncuestas
};
