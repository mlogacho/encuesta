// Preguntas y estructura
const LIKERT_ITEMS = [
  { id: 'frecuencia', title: 'Frecuencia: la frecuencia de las sesiones se ajusta a lo que necesito.' },
  { id: 'practicidad', title: 'Practicidad: lo que trabajo en las sesiones lo puedo aplicar de inmediato en mi búsqueda.' },
  { id: 'acompanamiento', title: 'Acompañamiento: me siento acompañado/a y escuchado/a en mi proceso de transición.' },
  { id: 'contenido', title: 'Contenido: los temas y materiales son pertinentes para mi objetivo profesional.' },
  { id: 'metodologia', title: 'Metodología: la forma en que se desarrollan las sesiones me resulta efectiva.' },
  { id: 'claridad', title: 'Claridad: tengo claro mi plan de trabajo y los siguientes pasos.' },
  { id: 'continuidad', title: 'Continuidad: el cambio de consultora se ha dado sin afectar mi proceso.' }
];

const EXPECTATIVAS_ITEMS = [
  'Claridad sobre mi siguiente paso profesional',
  'CV y LinkedIn competitivos',
  'Preparación para entrevistas',
  'Ampliar mi red de contactos',
  'Acceso a oportunidades laborales',
  'Conseguir un nuevo empleo',
  'Apoyo emocional en la transición',
  'Explorar emprendimiento o consultoría'
];

const PRIORIDADES_ITEMS = [
  'Estrategia de búsqueda y mercado oculto',
  'CV',
  'LinkedIn',
  'Entrevistas y simulaciones',
  'Negociación salarial',
  'Networking',
  'Marca personal',
  'Autoconocimiento (Birkman, CliftonStrengths)',
  'Emprendimiento',
  'Manejo emocional del cambio'
];

const FORMATOS_ITEMS = [
  'Sesiones individuales',
  'Talleres grupales con otros participantes',
  'Herramientas de autoservicio (por ejemplo, prompts de IA para CV y LinkedIn)'
];

// Estado global de la encuesta
const state = {
  currentStep: 0,
  totalSteps: 5,
  formData: {
    tiempo_programa: '',
    etapa_actual: '',
    valoraciones: {},
    expectativas_iniciales: [],
    expectativas_otro: '',
    cumplimiento_expectativas: null,
    prioridades_siguiente_etapa: [],
    formato_preferido: [],
    frecuencia_sesiones: '',
    nps_recomendacion: null,
    mantener_programa: '',
    mejorar_programa: '',
    ayuda_proximas_semanas: '',
    nombre_opcional: ''
  }
};

const survey = {
  init() {
    this.renderLikert();
    this.renderExpectativas();
    this.renderPrioridades();
    this.renderFormatos();
    this.renderNps();
    this.updateProgress();
  },

  renderLikert() {
    const container = document.getElementById('likertQuestionsContainer');
    container.innerHTML = LIKERT_ITEMS.map((item, idx) => `
      <div class="likert-group">
        <div class="likert-title">${idx + 1}. ${item.title}</div>
        <div class="likert-scale">
          ${[1, 2, 3, 4, 5].map(val => `
            <button class="scale-btn" type="button" onclick="survey.selectLikert('${item.id}', ${val}, this)">
              ${val}
            </button>
          `).join('')}
        </div>
        <div class="scale-legend">
          <span>1: Muy insatisfecho</span>
          <span>5: Muy satisfecho</span>
        </div>
      </div>
    `).join('');
  },

  renderExpectativas() {
    const container = document.getElementById('expectativasGrid');
    container.innerHTML = EXPECTATIVAS_ITEMS.map((item, idx) => `
      <div class="option-card" onclick="survey.toggleCheckbox('expectativas_iniciales', '${item}', this)">
        <span class="option-key">✓</span>
        <span class="option-label">${item}</span>
      </div>
    `).join('');
  },

  renderPrioridades() {
    const container = document.getElementById('prioridadesGrid');
    container.innerHTML = PRIORIDADES_ITEMS.map((item) => `
      <div class="option-card" onclick="survey.togglePrioridad('${item}', this)">
        <span class="option-key">+</span>
        <span class="option-label">${item}</span>
      </div>
    `).join('');
  },

  renderFormatos() {
    const container = document.getElementById('formatoGrid');
    container.innerHTML = FORMATOS_ITEMS.map((item) => `
      <div class="option-card" onclick="survey.toggleCheckbox('formato_preferido', '${item}', this)">
        <span class="option-key">✓</span>
        <span class="option-label">${item}</span>
      </div>
    `).join('');
  },

  renderNps() {
    const container = document.getElementById('npsGrid');
    container.innerHTML = Array.from({ length: 11 }, (_, i) => i).map(val => `
      <button class="nps-btn" type="button" onclick="survey.selectNps(${val}, this)">${val}</button>
    `).join('');
  },

  updateProgress() {
    const pct = Math.round((state.currentStep / state.totalSteps) * 100);
    const counterText = document.getElementById('stepCounterText');
    const percentText = document.getElementById('progressPercentText');
    const fill = document.getElementById('progressFill');

    if (state.currentStep === 0) {
      counterText.innerText = 'Inicio';
      percentText.innerText = '0% completado';
      fill.style.width = '5%';
    } else if (state.currentStep > state.totalSteps) {
      counterText.innerText = 'Completado';
      percentText.innerText = '100%';
      fill.style.width = '100%';
    } else {
      counterText.innerText = `Paso ${state.currentStep} de ${state.totalSteps}`;
      percentText.innerText = `${pct}% completado`;
      fill.style.width = `${pct}%`;
    }
  },

  showStep(step) {
    for (let i = 0; i <= 5; i++) {
      const el = document.getElementById(`step-${i}`);
      if (el) el.style.display = (i === step) ? 'block' : 'none';
    }
    const finalEl = document.getElementById('step-final');
    if (finalEl) finalEl.style.display = (step > 5) ? 'block' : 'none';

    state.currentStep = step;
    this.updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  nextStep() {
    this.showStep(state.currentStep + 1);
  },

  prevStep() {
    if (state.currentStep > 0) {
      this.showStep(state.currentStep - 1);
    }
  },

  selectRadio(field, value, el) {
    state.formData[field] = value;
    const parent = el.parentElement;
    parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  },

  selectLikert(metricId, val, btn) {
    state.formData.valoraciones[metricId] = val;
    const parent = btn.parentElement;
    parent.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  },

  selectScale(field, val, btn) {
    state.formData[field] = val;
    const parent = btn.parentElement;
    parent.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  },

  selectNps(val, btn) {
    state.formData.nps_recomendacion = val;
    const parent = btn.parentElement;
    parent.querySelectorAll('.nps-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  },

  toggleCheckbox(field, val, el) {
    const list = state.formData[field];
    const index = list.indexOf(val);
    if (index > -1) {
      list.splice(index, 1);
      el.classList.remove('selected');
    } else {
      list.push(val);
      el.classList.add('selected');
    }
  },

  togglePrioridad(val, el) {
    const list = state.formData.prioridades_siguiente_etapa;
    const index = list.indexOf(val);

    if (index > -1) {
      list.splice(index, 1);
      el.classList.remove('selected');
    } else {
      if (list.length >= 3) {
        alert('Por favor selecciona exactamente 3 opciones principales.');
        return;
      }
      list.push(val);
      el.classList.add('selected');
    }

    const badge = document.getElementById('prioridadesCountBadge');
    badge.innerText = `${list.length} de 3 seleccionados`;
    badge.style.color = list.length === 3 ? 'var(--success)' : 'var(--accent)';
  },

  validateAndNext(step) {
    if (step === 1) {
      if (!state.formData.tiempo_programa) {
        alert('Por favor selecciona cuánto tiempo llevas en el programa.');
        return;
      }
      if (!state.formData.etapa_actual) {
        alert('Por favor indica en qué etapa estás hoy.');
        return;
      }
    }

    if (step === 2) {
      const keys = Object.keys(state.formData.valoraciones);
      if (keys.length < LIKERT_ITEMS.length) {
        alert('Por favor califica todas las afirmaciones de valoración (1 al 5).');
        return;
      }
    }

    if (step === 3) {
      const otro = document.getElementById('expectativas_otro').value.trim();
      state.formData.expectativas_otro = otro;

      if (state.formData.expectativas_iniciales.length === 0 && !otro) {
        alert('Por favor marca al menos una expectativa que tenías al iniciar.');
        return;
      }
      if (state.formData.cumplimiento_expectativas === null) {
        alert('Por favor califica el cumplimiento de tus expectativas (1 al 5).');
        return;
      }
    }

    if (step === 4) {
      if (state.formData.prioridades_siguiente_etapa.length !== 3) {
        alert('Debes elegir exactamente 3 temas prioritarios para la siguiente etapa.');
        return;
      }
      if (state.formData.formato_preferido.length === 0) {
        alert('Por favor selecciona al menos un formato preferido.');
        return;
      }
      if (!state.formData.frecuencia_sesiones) {
        alert('Por favor indica con qué frecuencia te gustaría tener sesiones.');
        return;
      }
    }

    this.nextStep();
  },

  async submit() {
    if (state.formData.nps_recomendacion === null) {
      alert('Por favor indícanos del 0 al 10 qué tan probable es que recomiendes el programa.');
      return;
    }

    // Tomar campos abiertos opcionales
    state.formData.mantener_programa = document.getElementById('mantener_programa').value.trim();
    state.formData.mejorar_programa = document.getElementById('mejorar_programa').value.trim();
    state.formData.ayuda_proximas_semanas = document.getElementById('ayuda_proximas_semanas').value.trim();
    state.formData.nombre_opcional = document.getElementById('nombre_opcional').value.trim();

    const submitBtn = document.getElementById('btnSubmitSurvey');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Enviando...';

    try {
      const res = await fetch('/api/encuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.showStep(6); // Pantalla de éxito
      } else {
        alert(data.error || 'Ocurrió un error al enviar tu respuesta. Por favor intenta de nuevo.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Enviar Encuesta';
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al enviar la encuesta.');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Enviar Encuesta';
    }
  }
};

// Panel Administrativo
const admin = {
  token: localStorage.getItem('career_admin_token') || '',
  respuestasCache: [],
  analiticaCache: null,
  charts: {},
  selectedIds: new Set(),

  openModal() {
    document.getElementById('adminModal').classList.add('active');
    if (this.token) {
      this.fetchRespuestas();
    } else {
      document.getElementById('adminLoginForm').style.display = 'block';
      document.getElementById('adminDashboardContent').style.display = 'none';
    }
  },

  closeModal() {
    document.getElementById('adminModal').classList.remove('active');
  },

  cerrarDetalle() {
    document.getElementById('detalleModal').classList.remove('active');
  },

  async login() {
    const pwd = document.getElementById('adminPasswordInput').value;
    const errText = document.getElementById('adminLoginError');
    errText.style.display = 'none';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.token = data.token;
        localStorage.setItem('career_admin_token', this.token);
        this.fetchRespuestas();
      } else {
        errText.style.display = 'block';
      }
    } catch (e) {
      errText.innerText = 'Error de red';
      errText.style.display = 'block';
    }
  },

  async fetchRespuestas() {
    try {
      const res = await fetch('/api/admin/respuestas', {
        headers: { 'x-admin-token': this.token }
      });
      if (res.status === 401) {
        localStorage.removeItem('career_admin_token');
        this.token = '';
        document.getElementById('adminLoginForm').style.display = 'block';
        document.getElementById('adminDashboardContent').style.display = 'none';
        return;
      }
      const data = await res.json();
      if (data.success) {
        document.getElementById('adminLoginForm').style.display = 'none';
        document.getElementById('adminDashboardContent').style.display = 'block';

        this.respuestasCache = data.respuestas || [];
        this.analiticaCache = data.analitica || {};

        // KPIs
        const analitica = data.analitica;
        document.getElementById('statTotalEncuestas').innerText = analitica.total || 0;
        
        const npsScoreEl = document.getElementById('statNpsScore');
        const nps = analitica.nps || { score: 0, promotoresPct: 0, detractoresPct: 0 };
        npsScoreEl.innerText = `${nps.score > 0 ? '+' : ''}${nps.score}`;
        npsScoreEl.style.color = nps.score >= 50 ? '#10b981' : (nps.score >= 0 ? '#38bdf8' : '#ef4444');
        
        document.getElementById('statNpsBreakdown').innerText = 
          `Promotores: ${nps.promotoresPct}% | Pasivos: ${nps.pasivosPct}% | Detractores: ${nps.detractoresPct}%`;
        
        document.getElementById('statCumplimiento').innerText = 
          `${(analitica.cumplimiento && analitica.cumplimiento.promedio) || 0} / 5`;

        // Llenar selector de etapas
        const selectEtapa = document.getElementById('adminFilterEtapa');
        const etapasActuales = Object.keys(analitica.etapasDistribucion || {});
        selectEtapa.innerHTML = '<option value="">Todas las etapas</option>' + 
          etapasActuales.map(e => `<option value="${e}">${e}</option>`).join('');

        // Render gráficos
        this.renderCharts(analitica);

        // Render tabla
        this.filtrarTabla();
      }
    } catch (e) {
      console.error(e);
    }
  },

  destroyChart(id) {
    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }
  },

  renderCharts(data) {
    if (!window.Chart) {
      console.warn('Chart.js no cargado');
      return;
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    // 1. NPS Breakdown Donut
    this.destroyChart('nps');
    const ctxNps = document.getElementById('chartNpsBreakdown');
    if (ctxNps) {
      const n = data.nps || { promotores: 0, pasivos: 0, detractores: 0 };
      this.charts['nps'] = new Chart(ctxNps, {
        type: 'doughnut',
        data: {
          labels: ['Promotores (9-10)', 'Pasivos (7-8)', 'Detractores (0-6)'],
          datasets: [{
            data: [n.promotores, n.pasivos, n.detractores],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderColor: '#0f172a',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } }
          },
          cutout: '65%'
        }
      });
    }

    // 2. Radar de Valoración (7 Métricas)
    this.destroyChart('radar');
    const ctxRadar = document.getElementById('chartRadarValoracion');
    if (ctxRadar) {
      const v = data.valoracionesRadar || {};
      const labels = [
        'Frecuencia', 'Practicidad', 'Acompañamiento',
        'Contenido', 'Metodología', 'Claridad', 'Continuidad'
      ];
      const values = [
        v.frecuencia || 0, v.practicidad || 0, v.acompanamiento || 0,
        v.contenido || 0, v.metodologia || 0, v.claridad || 0, v.continuidad || 0
      ];

      this.charts['radar'] = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels,
          datasets: [{
            label: 'Satisfacción (1 a 5)',
            data: values,
            fill: true,
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            borderColor: '#38bdf8',
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#38bdf8'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 5,
              ticks: { stepSize: 1, backdropColor: 'transparent', color: '#64748b' },
              grid: { color: 'rgba(255, 255, 255, 0.08)' },
              angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
              pointLabels: { font: { size: 11 }, color: '#cbd5e1' }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // 3. Top Prioridades (Horizontal Bar)
    this.destroyChart('prioridades');
    const ctxPrioridades = document.getElementById('chartPrioridades');
    if (ctxPrioridades) {
      const prioridadesObj = data.prioridadesTop || {};
      const sorted = Object.entries(prioridadesObj).sort((a, b) => b[1] - a[1]);
      const pLabels = sorted.map(i => i[0]);
      const pVals = sorted.map(i => i[1]);

      this.charts['prioridades'] = new Chart(ctxPrioridades, {
        type: 'bar',
        data: {
          labels: pLabels.length ? pLabels : ['Sin respuestas'],
          datasets: [{
            label: 'Votos',
            data: pVals.length ? pVals : [0],
            backgroundColor: '#2563eb',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 10 } }
            }
          }
        }
      });
    }

    // 4. Etapas Distribución (Doughnut)
    this.destroyChart('etapas');
    const ctxEtapas = document.getElementById('chartEtapas');
    if (ctxEtapas) {
      const etapasObj = data.etapasDistribucion || {};
      const eLabels = Object.keys(etapasObj);
      const eVals = Object.values(etapasObj);

      this.charts['etapas'] = new Chart(ctxEtapas, {
        type: 'pie',
        data: {
          labels: eLabels.length ? eLabels : ['Sin datos'],
          datasets: [{
            data: eVals.length ? eVals : [0],
            backgroundColor: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399'],
            borderColor: '#0f172a',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } }
          }
        }
      });
    }

    // 5. Expectativas Iniciales (Bar vertical)
    this.destroyChart('expectativas');
    const ctxExp = document.getElementById('chartExpectativas');
    if (ctxExp) {
      const expObj = data.expectativasFrecuencia || {};
      const sortedExp = Object.entries(expObj).sort((a, b) => b[1] - a[1]);
      const exLabels = sortedExp.map(i => i[0]);
      const exVals = sortedExp.map(i => i[1]);

      this.charts['expectativas'] = new Chart(ctxExp, {
        type: 'bar',
        data: {
          labels: exLabels.length ? exLabels : ['Sin datos'],
          datasets: [{
            label: 'Menciones',
            data: exVals.length ? exVals : [0],
            backgroundColor: '#0ea5e9',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } }
            }
          }
        }
      });
    }
  },

  filtrarTabla() {
    const q = (document.getElementById('adminSearchInput').value || '').toLowerCase().trim();
    const filtroEtapa = document.getElementById('adminFilterEtapa').value;

    const filtradas = this.respuestasCache.filter(r => {
      if (filtroEtapa && r.etapa_actual !== filtroEtapa) return false;
      if (!q) return true;

      const matchNombre = (r.nombre_opcional || '').toLowerCase().includes(q);
      const matchEtapa = (r.etapa_actual || '').toLowerCase().includes(q);
      const matchTiempo = (r.tiempo_programa || '').toLowerCase().includes(q);
      const matchMejorar = (r.mejorar_programa || '').toLowerCase().includes(q);
      const matchMantener = (r.mantener_programa || '').toLowerCase().includes(q);

      return matchNombre || matchEtapa || matchTiempo || matchMejorar || matchMantener;
    });

    const tbody = document.getElementById('respuestasTableBody');
    if (filtradas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay respuestas que coincidan con los filtros.</td></tr>';
      this.actualizarUISeleccionados();
      return;
    }

    tbody.innerHTML = filtradas.map(r => {
      const checked = this.selectedIds.has(r.id) ? 'checked' : '';
      return `
      <tr>
        <td style="text-align: center;">
          <input type="checkbox" style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--primary);" 
                 value="${r.id}" ${checked} onchange="admin.toggleSelectRow(${r.id}, this.checked)">
        </td>
        <td>#${r.id}</td>
        <td>${new Date(r.fecha_registro).toLocaleDateString()}</td>
        <td><strong>${r.nombre_opcional || '<span style="color:var(--text-muted);">Anónimo</span>'}</strong></td>
        <td>${r.tiempo_programa || '-'}</td>
        <td><span class="badge-tag">${r.etapa_actual || '-'}</span></td>
        <td><span style="font-weight: 700; color: ${r.nps_recomendacion >= 9 ? '#10b981' : (r.nps_recomendacion >= 7 ? '#f59e0b' : '#ef4444')};">${r.nps_recomendacion !== null ? r.nps_recomendacion : '-'}</span></td>
        <td>${r.cumplimiento_expectativas ? `${r.cumplimiento_expectativas}/5` : '-'}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; margin-right: 0.35rem;" onclick="admin.verDetalle(${r.id})">
            Ver Ficha
          </button>
          <button class="btn btn-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; color: #f87171; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1);" onclick="admin.eliminarUna(${r.id})">
            Eliminar
          </button>
        </td>
      </tr>
      `;
    }).join('');

    this.actualizarUISeleccionados();
  },

  toggleSelectRow(id, isChecked) {
    if (isChecked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
    this.actualizarUISeleccionados();
  },

  toggleSelectAll(masterCheckbox) {
    const isChecked = masterCheckbox.checked;
    this.respuestasCache.forEach(r => {
      if (isChecked) {
        this.selectedIds.add(r.id);
      } else {
        this.selectedIds.delete(r.id);
      }
    });
    this.filtrarTabla();
  },

  actualizarUISeleccionados() {
    const count = this.selectedIds.size;
    const btnEliminar = document.getElementById('btnEliminarSeleccionadas');
    const btnCount = document.getElementById('btnEliminarCount');
    const labelCount = document.getElementById('seleccionadosCountLabel');
    const masterCheckbox = document.getElementById('selectAllCheckbox');

    if (btnCount) btnCount.innerText = count;
    if (labelCount) labelCount.innerText = `${count} seleccionada(s)`;

    if (btnEliminar) {
      btnEliminar.style.display = count > 0 ? 'inline-flex' : 'none';
    }

    if (masterCheckbox) {
      masterCheckbox.checked = this.respuestasCache.length > 0 && count === this.respuestasCache.length;
    }
  },

  async eliminarUna(id) {
    const r = this.respuestasCache.find(x => x.id === id);
    const nombre = (r && r.nombre_opcional) ? `de "${r.nombre_opcional}"` : `#${id}`;
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la encuesta ${nombre}?`)) {
      return;
    }

    await this.ejecutarEliminacion([id]);
  },

  async eliminarSeleccionadas() {
    const count = this.selectedIds.size;
    if (count === 0) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente las ${count} encuestas seleccionadas? Esta acción no se puede deshacer.`)) {
      return;
    }

    await this.ejecutarEliminacion(Array.from(this.selectedIds));
  },

  async ejecutarEliminacion(ids) {
    try {
      const res = await fetch('/api/admin/encuestas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.token
        },
        body: JSON.stringify({ ids })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        ids.forEach(id => this.selectedIds.delete(id));
        await this.fetchRespuestas();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al eliminar');
    }
  },

  verDetalle(id) {
    const r = this.respuestasCache.find(x => x.id === id);
    if (!r) return;

    document.getElementById('detalleModalTitle').innerText = `Encuesta #${r.id} · ${r.nombre_opcional || 'Participante Anónimo'}`;

    const v = r.valoraciones || {};
    const html = `
      <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem;">
          <div><strong>Fecha:</strong> ${new Date(r.fecha_registro).toLocaleString()}</div>
          <div><strong>Tiempo en Programa:</strong> ${r.tiempo_programa || '-'}</div>
          <div><strong>Etapa Actual:</strong> ${r.etapa_actual || '-'}</div>
          <div><strong>NPS Recomendación:</strong> <span style="color:var(--accent); font-weight:700;">${r.nps_recomendacion} / 10</span></div>
          <div><strong>Cumplimiento de Expectativas:</strong> ${r.cumplimiento_expectativas} / 5</div>
          <div><strong>Frecuencia de Sesiones Deseada:</strong> ${r.frecuencia_sesiones || '-'}</div>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--accent); display: block; margin-bottom: 0.35rem;">Valoración por Dimensiones (1 a 5):</strong>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; font-size: 0.8rem;">
          <div>• Frecuencia: <strong>${v.frecuencia || '-'}</strong></div>
          <div>• Practicidad: <strong>${v.practicidad || '-'}</strong></div>
          <div>• Acompañamiento: <strong>${v.acompanamiento || '-'}</strong></div>
          <div>• Contenido: <strong>${v.contenido || '-'}</strong></div>
          <div>• Metodología: <strong>${v.metodologia || '-'}</strong></div>
          <div>• Claridad de Plan: <strong>${v.claridad || '-'}</strong></div>
          <div>• Continuidad en Cambio: <strong>${v.continuidad || '-'}</strong></div>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--accent); display: block; margin-bottom: 0.35rem;">Expectativas Iniciales Declaradas:</strong>
        <p style="font-size: 0.85rem; color: var(--text-main);">${(r.expectativas_iniciales || []).join(', ') || 'Ninguna marcada'}</p>
        ${r.expectativas_otro ? `<p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Otro: ${r.expectativas_otro}</p>` : ''}
      </div>

      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--accent); display: block; margin-bottom: 0.35rem;">Top 3 Prioridades Seleccionadas:</strong>
        <p style="font-size: 0.85rem; color: var(--text-main);">${(r.prioridades_siguiente_etapa || []).join(' • ') || '-'}</p>
      </div>

      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--accent); display: block; margin-bottom: 0.35rem;">Formatos Preferidos:</strong>
        <p style="font-size: 0.85rem; color: var(--text-main);">${(r.formato_preferido || []).join(', ') || '-'}</p>
      </div>

      <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #10b981; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.75rem;">
        <strong style="font-size: 0.85rem; color: #10b981;">¿Qué deberíamos mantener?</strong>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">${r.mantener_programa || '<span style="color:var(--text-muted);">Sin comentario</span>'}</p>
      </div>

      <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #f59e0b; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.75rem;">
        <strong style="font-size: 0.85rem; color: #f59e0b;">¿Qué deberíamos mejorar?</strong>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">${r.mejorar_programa || '<span style="color:var(--text-muted);">Sin comentario</span>'}</p>
      </div>

      <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #38bdf8; padding: 0.75rem; border-radius: 6px;">
        <strong style="font-size: 0.85rem; color: #38bdf8;">¿Qué te ayudaría en las próximas 4 semanas?</strong>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">${r.ayuda_proximas_semanas || '<span style="color:var(--text-muted);">Sin comentario</span>'}</p>
      </div>
    `;

    document.getElementById('detalleModalBody').innerHTML = html;
    document.getElementById('detalleModal').classList.add('active');
  }
};

// Listeners
document.getElementById('openAdminBtn').addEventListener('click', () => admin.openModal());
document.addEventListener('DOMContentLoaded', () => survey.init());
