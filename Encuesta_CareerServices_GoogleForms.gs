/**
 * Encuesta diagnóstica · Career Services · Cornerstone International Group Ecuador
 * Crea automáticamente el Google Form y la hoja de respuestas.
 *
 * Cómo usarlo:
 * 1. Entra a https://script.google.com → "Nuevo proyecto".
 * 2. Borra el contenido, pega este código y guarda.
 * 3. Selecciona la función crearEncuesta y presiona "Ejecutar". Autoriza los permisos.
 * 4. Abre "Registro de ejecución": ahí verás el link para editar y el link para enviar.
 */
function crearEncuesta() {
  const ESCALA = ['Muy insatisfecho', 'Muy satisfecho'];

  const form = FormApp.create('Encuesta de experiencia · Programa de Transición de Carrera');
  form.setDescription(
    'Asumí el acompañamiento de tu programa de transición de carrera y quiero asegurarme de que responda a lo que hoy necesitas. ' +
    'Tus respuestas son confidenciales y me ayudarán a ajustar el proceso. Te tomará entre 5 y 7 minutos.\n\n' +
    'María Dolores Tito · Cornerstone International Group'
  );
  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setConfirmationMessage('¡Gracias! Tu opinión es clave para que el programa responda a lo que necesitas. Revisaremos los resultados en nuestra próxima sesión.');

  // ---------- Sección 1 ----------
  form.addSectionHeaderItem().setTitle('1. Tu momento actual');

  form.addMultipleChoiceItem()
    .setTitle('¿Cuánto tiempo llevas en el programa?')
    .setChoiceValues(['Menos de 1 mes', 'Entre 1 y 3 meses', 'Entre 3 y 6 meses', 'Más de 6 meses'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('¿En qué etapa estás hoy?')
    .setChoiceValues([
      'Definiendo mi objetivo profesional',
      'Preparando mis herramientas (CV, LinkedIn)',
      'Buscando activamente y postulando',
      'En procesos de entrevista',
      'Ya me recoloqué o estoy emprendiendo'
    ])
    .setRequired(true);

  // ---------- Sección 2 ----------
  form.addPageBreakItem()
    .setTitle('2. Valoración del programa')
    .setHelpText('Califica cada afirmación del 1 (muy insatisfecho) al 5 (muy satisfecho).');

  [
    'Frecuencia: la frecuencia de las sesiones se ajusta a lo que necesito.',
    'Practicidad: lo que trabajo en las sesiones lo puedo aplicar de inmediato en mi búsqueda.',
    'Acompañamiento: me siento acompañado/a y escuchado/a en mi proceso de transición.',
    'Contenido: los temas y materiales son pertinentes para mi objetivo profesional.',
    'Metodología: la forma en que se desarrollan las sesiones me resulta efectiva.',
    'Claridad: tengo claro mi plan de trabajo y los siguientes pasos.',
    'Continuidad: el cambio de consultora se ha dado sin afectar mi proceso.'
  ].forEach(function (titulo) {
    form.addScaleItem().setTitle(titulo).setBounds(1, 5).setLabels(ESCALA[0], ESCALA[1]).setRequired(true);
  });

  // ---------- Sección 3 ----------
  form.addPageBreakItem().setTitle('3. Tus expectativas');

  form.addCheckboxItem()
    .setTitle('Al iniciar el programa, ¿qué esperabas lograr?')
    .setHelpText('Puedes marcar varias opciones.')
    .setChoiceValues([
      'Claridad sobre mi siguiente paso profesional',
      'CV y LinkedIn competitivos',
      'Preparación para entrevistas',
      'Ampliar mi red de contactos',
      'Acceso a oportunidades laborales',
      'Conseguir un nuevo empleo',
      'Apoyo emocional en la transición',
      'Explorar emprendimiento o consultoría'
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addScaleItem()
    .setTitle('¿En qué medida el programa ha cumplido esas expectativas hasta hoy?')
    .setBounds(1, 5).setLabels('Nada', 'Totalmente')
    .setRequired(true);

  // ---------- Sección 4 ----------
  form.addPageBreakItem().setTitle('4. Prioridades para la siguiente etapa');

  form.addCheckboxItem()
    .setTitle('Elige los 3 temas que más te ayudarían ahora')
    .setChoiceValues([
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
    ])
    .setValidation(FormApp.createCheckboxValidation().requireSelectExactly(3).setHelpText('Selecciona exactamente 3 opciones.').build())
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('¿Qué formato prefieres?')
    .setHelpText('Puedes marcar varias opciones.')
    .setChoiceValues([
      'Sesiones individuales',
      'Talleres grupales con otros participantes',
      'Herramientas de autoservicio (por ejemplo, prompts de IA para CV y LinkedIn)'
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('¿Con qué frecuencia te gustaría tener sesiones?')
    .setChoiceValues(['Semanal', 'Quincenal', 'Mensual'])
    .setRequired(true);

  // ---------- Sección 5 ----------
  form.addPageBreakItem().setTitle('5. Recomendación y mejora');

  form.addScaleItem()
    .setTitle('Del 0 al 10, ¿qué tan probable es que recomiendes este programa a un colega?')
    .setBounds(0, 10).setLabels('Nada probable', 'Muy probable')
    .setRequired(true);

  form.addParagraphTextItem().setTitle('¿Qué deberíamos mantener del programa?');
  form.addParagraphTextItem().setTitle('¿Qué deberíamos mejorar?');
  form.addParagraphTextItem().setTitle('¿Qué te ayudaría más en las próximas 4 semanas?');

  form.addTextItem()
    .setTitle('Tu nombre (opcional)')
    .setHelpText('Si lo compartes, podré darte seguimiento personalizado. Tus respuestas siguen siendo confidenciales.');

  // ---------- Hoja de respuestas ----------
  const hoja = SpreadsheetApp.create('Respuestas · Encuesta Career Services');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());

  Logger.log('Editar formulario: ' + form.getEditUrl());
  Logger.log('Link para enviar a clientes: ' + form.getPublishedUrl());
  Logger.log('Hoja de respuestas: ' + hoja.getUrl());
}
