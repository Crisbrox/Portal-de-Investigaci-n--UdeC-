/**
 * constants/catalogos.js
 * Catálogos del frontend (espejo de backend/utils/catalogos.js).
 */

export const TIPOLOGIAS = [
  'Actividades de formación',
  'Apropiación social del conocimiento',
  'Producción bibliográfica',
  'Demás Trabajos',
  'Producción Técnica y Tecnológica',
  'Reconocimientos y premios',
  'Proyectos',
];

export const SUB_TIPOLOGIAS = {
  'Actividades de formación': [
    'Trabajo dirigido de pregrado',
    'Trabajo dirigido de maestria',
    'Apoyo a la creación de Programas',
    'Cursos de corta duración',
    'Proyecto de aula',
  ],
  'Apropiación social del conocimiento': [
    'Circulación de conocimiento especializado',
    'Participación Ciudadana',
    'Procesos de Apropiación Social del Conocimiento',
    'Producciones de contenido digital',
    'Divulgación Pública de la Ciencia',
    'Redes de Conocimiento Especializado',
  ],
  'Producción bibliográfica': [
    'Producción Bibliográfica Resultado de Investigación',
    'Artículo publicado en revista especializada',
    'Otros artículos publicados',
    'Capítulos de libro publicados',
    'Documento de trabajo (Working Paper)',
    'Edición',
    'Demás Tipos de Produccción Bibliográfica',
  ],
  'Demás Trabajos': [
    'Proyecto de aula',
    'Cursos de corta duración',
    'Apoyo a la creación de Programas',
  ],
  'Producción Técnica y Tecnológica': [
    'Software',
    'Prototipo',
    'Producto Tecnológico',
    'Innovación en Procesos y Servicios',
  ],
  'Reconocimientos y premios': ['Reconocimientos y premios'],
  'Proyectos': ['Proyectos'],
};

export const CLASIFICACIONES_POR_SUBTIPOLOGIA = {
  'Trabajo dirigido de pregrado': ['Trabajos de grado de pregrado', 'Evento Científico', 'Memorias'],
  'Trabajo dirigido de maestria': ['Trabajos de grado de maestria', 'Evento Científico', 'Memorias'],
  'Circulación de conocimiento especializado': [
    'Evento Científico',
    'Evento Científico. Memorias',
    'Memorias',
    'Organizador Evento Científico',
    'Redes de Conocimiento Especializado',
  ],
  'Participación Ciudadana': [
    'Espacio de Participación Ciudadana',
    'Espacio de Participación Ciudadana en Proyectos de Ctel',
    'Fortalecimiento o Solución de Asuntos de Interés Social',
  ],
  'Procesos de Apropiación Social del Conocimiento': [
    'Fortalecimiento o Solución de Asuntos de Interés Social',
    'Espacio de Participación Ciudadana',
    'Informe de Investigación',
  ],
  'Producciones de contenido digital': [
    'Audiovisual',
    'Producción de estrategias y contenidos transmedia',
    'Otra publicación divulgativa',
  ],
  'Divulgación Pública de la Ciencia': [
    'Libros de divulgación y/o Compilación de divulgación',
    'Otra publicación divulgativa',
    'Audiovisual',
  ],
  'Redes de Conocimiento Especializado': [
    'Redes de Conocimiento Especializado',
    'Evento Científico',
    'Informe de Investigación',
  ],
  'Producción Bibliográfica Resultado de Investigación': [
    'Libro Completo Resultado de Investigación',
    'Capítulo de libro',
    'Artículo publicado',
  ],
  'Artículo publicado en revista especializada': ['Artículo publicado', 'Revista'],
  'Otros artículos publicados': ['Otro artículo publicado', 'Artículo publicado', 'Revista'],
  'Capítulos de libro publicados': ['Capítulo de libro', 'Libro'],
  'Documento de trabajo (Working Paper)': ['Informe de Investigación', 'Otro'],
  Edición: ['Libro', 'Libros de Formación', 'Libros de divulgación y/o Compilación de divulgación'],
  'Demás Tipos de Produccción Bibliográfica': [
    'Manuales y guías especializadas',
    'Otra publicación divulgativa',
    'Libro',
    'Otro',
  ],
  Software: ['Software', 'Desarrollos Web'],
  Prototipo: ['Prototipo', 'Innovaciones en Procesos y Procedimientos'],
  'Producto Tecnológico': [
    'Registro calificado',
    'Secreto empresarial',
    'Innovaciones en Procesos y Procedimientos',
    'Prototipo',
  ],
  'Innovación en Procesos y Servicios': [
    'Innovaciones en Procesos y Procedimientos',
    'Registro calificado',
    'Secreto empresarial',
  ],
  'Apoyo a la creación de Programas': ['Otro', 'Informe de Investigación'],
  'Cursos de corta duración': ['Libros de Formación', 'Otro'],
  'Proyecto de aula': ['Otro', 'Informe de Investigación'],
  Proyectos: ['Informe de Investigación', 'Investigación y desarrollo', 'Otro'],
  'Reconocimientos y premios': ['Reconocimientos y premios', 'Otro'],
};

export const ESTADOS_EVIDENCIA = ['Parcial', 'Con evidencia', 'Sin evidencia', 'No verificado'];

export const SEDES = [
  'Fusagasugá',
  'Chía',
  'Facatativá',
  'Girardot',
  'Soacha',
  'Ubaté',
  'Zipaquirá',
];

export const SECTORES = [
  'Tecnología',
  'Agroindustria',
  'Comercio',
  'Servicios',
  'Gastronomía',
  'Moda y Diseño',
  'Sostenibilidad',
  'Otros',
];

export const ETAPAS = ['Idea', 'Prototipo', 'En marcha'];

export const PROGRAMAS = [
  'Administración de Empresas',
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Ingeniería Electrónica',
  'Contaduría Pública',
  'Derecho',
  'Psicología',
  'Trabajo Social',
  'Enfermería',
  'Medicina Veterinaria y Zootecnia',
  'Agronomía',
  'Ingeniería Agroindustrial',
  'Negocios Internacionales',
  'Comunicación Social',
  'Diseño Gráfico',
  'Administración Turística y Hotelera',
  'Tecnología en Desarrollo de Software',
  'Tecnología en Gestión Logística',
  'Otro',
];

/** Periodos académicos válidos: IPA-AAAA / IIPA-AAAA / NA. */
export function generarPeriodos(anioMin = 2019, anioMax = 2026) {
  const opciones = ['NA'];
  for (let a = anioMax; a >= anioMin; a--) {
    opciones.push(`IIPA-${a}`);
    opciones.push(`IPA-${a}`);
  }
  return opciones;
}

/** Años disponibles para el stepper. */
export function generarAnios(anioMin = 2019, anioMax = new Date().getFullYear() + 1) {
  const arr = [];
  for (let a = Math.max(anioMax, 2026); a >= anioMin; a--) arr.push(a);
  return arr;
}
