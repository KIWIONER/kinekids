export interface DescriptionBadge {
  label: string;
  type: "oeko" | "handmade" | "washable" | "wood" | "safety" | "default";
}

export interface DescriptionFeature {
  title: string;
  text: string;
}

export interface ParsedDescription {
  leadParagraph: string;
  badges: DescriptionBadge[];
  includedItems: string[];
  features: DescriptionFeature[];
  fullTextClean: string;
}

/**
 * Diccionario y normalizador instantáneo al español para descripciones de producto.
 */
export function normalizeToSpanish(text: string): string {
  if (!text) return "";
  let clean = text
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Sustituciones directas de familias de producto clave

  // Torre de Aprendizaje Transformable
  if (
    clean.includes("From curious toddler to confident little chef") ||
    clean.includes("Transformable Design") ||
    clean.includes("transformable kitchen") ||
    clean.includes("standing step tower") ||
    clean.includes("TKT-02") ||
    clean.includes("smart tower that grows with your child")
  ) {
    return "De pequeño explorador a chef independiente: una torre de aprendizaje evolutiva y transformable que crece con tu hijo. Funciona como torre de observación segura para ayudar en la cocina, se pliega fácilmente convirtiéndose en mesa y silla infantil para dibujar y merendar, y fomenta la autonomía y vida práctica Montessori. Fabricada en Europa con madera de abedul de silvicultura sostenible y barnices ecológicos al agua completamente seguros.";
  }

  // Mobiliario Infantil KOTTO
  if (clean.includes("KOTTO ELIN changing dresser") || clean.includes("changing dresser is a perfect blend")) {
    return "La cómoda cambiador KOTTO ELIN combina a la perfección un diseño nórdico minimalista con una funcionalidad excepcional. Su estética elegante y sofisticada aporta calidez a cualquier habitación infantil, convirtiéndose en una pieza imprescindible para el cuidado y cambio diario del bebé.";
  }

  if (clean.includes("KOTTO ELIN crib") || (clean.includes("Crib ELIN") && clean.includes("blend of minimalist"))) {
    return "La cuna infantil KOTTO ELIN ofrece un entorno de descanso seguro, ergonómico y sereno. Fabricada con materiales de alta calidad y acabados no tóxicos, garantiza un sueño reparador en los primeros años de vida.";
  }

  if (clean.includes("KOTTO OLIN round crib") || clean.includes("Round Crib OLIN")) {
    return "La cuna redonda evolutiva KOTTO OLIN es una obra de arte del diseño infantil. Su forma circular envolvente transmite seguridad y confort al recién nacido, adaptándose al crecimiento del niño.";
  }

  if (clean.includes("Large Wicker Basket")) {
    return "Cesta de mimbre artesanal de gran capacidad, ideal para organizar juguetes, mantas y ropa infantil aportando un toque natural y acogedor a la estancia.";
  }

  // IGLU Soft Play Sets
  if (clean.includes("Create endless adventures with the IGLU Explorer Set") || clean.includes("IGLU Explorer Set — a 6-piece") || clean.includes("Explorer Set")) {
    return "Crea infinitas aventuras con el set IGLU Explorer: una colección de 6 piezas de juego blando que incluye rampas, bloques y esquinas. Los peques pueden construir, trepar y explorar mientras desarrollan su psicomotricidad gruesa, creatividad y equilibrio: un conjunto Montessori ideal para el movimiento libre y el juego activo.";
  }

  if (clean.includes("playset is a canvas for your child's creativity") || clean.includes("Adventurer 10-piece playset") || clean.includes("IGLU Adventurer")) {
    return "El set de 10 bloques blandos de psicomotricidad es un lienzo para la creatividad y el movimiento libre de tu peque. Con diversas formas geométricas y tamaños, ofrece infinitas posibilidades para el juego imaginativo, la construcción de circuitos y la exploración espacial segura.";
  }

  if (clean.includes("Each mat in this set is designed") || clean.includes("Safety and Comfort 5 Mat Set") || clean.includes("5 mat set")) {
    return "Cada colchoneta de este set de 5 piezas está diseñada para proporcionar una superficie segura, mullida y protectora, amortiguando caídas y creando una zona de suelo ideal para el gateo, los primeros pasos y la gimnasia infantil con total tranquilidad.";
  }

  if (clean.includes("Corner Climber") || clean.includes("designed to promote gross motor skills")) {
    return "El set de 5 piezas Corner Climber está diseñado para fomentar las habilidades motrices gruesas, el equilibrio, la coordinación y la confianza al escalar y gatear en cualquier rincón del hogar.";
  }

  if (clean.includes("Baby Gym") && clean.includes("canvas for your child")) {
    return "El gimnasio de juego blando multifuncional es un espacio seguro y versátil para estimular el desarrollo motriz temprano, la fuerza muscular y la autonomía en los primeros años de vida.";
  }

  if (clean.includes("Soft Play Shape Wedge") || clean.includes("Shape Wedge")) {
    return "Módulo rampa cuña de espuma firme para psicomotricidad infantil. Favorece la coordinación motriz, el gateo y las transiciones de altura con total seguridad y confort.";
  }

  if (clean.includes("IGLU products are made of") || clean.includes("made of firm") || clean.includes("closed cell structure")) {
    return "Los módulos y formas de psicomotricidad IGLU están fabricados con espuma de alta densidad de primera calidad, 100% reciclable y con estructura celular cerrada: suave, ultraligera y de máxima durabilidad. Revestidos en piel ecológica de tacto agradable, impermeable y muy fácil de limpiar con un paño húmedo.";
  }

  // Tipis, Asientos y Arcos
  if (clean.includes("Create a magical spot for your little ones with our premium children's teepee tent") || clean.includes("teepee tent")) {
    return "Crea un rincón mágico y acogedor para tus peques con nuestra tienda tipi Montessori premium, confeccionada a mano con algodón 100% transpirable y postes de madera natural pulida.";
  }

  if (clean.includes("Outzy Pocket Sofa") || clean.includes("Pocket Sofa For Children")) {
    return "El sofá infantil modular de espuma Outzy es el espacio perfecto para el descanso, la lectura y el juego interactivo. Desenfundable, ligero y fabricado con materiales suaves y resistentes.";
  }

  if (clean.includes("MeowBaby Archway") || clean.includes("Archway add-on")) {
    return "Módulo de arco y psicomotricidad MeowBaby de espuma firme para sofá infantil. Amplía las posibilidades de juego libre creando túneles, puentes y refugios seguros.";
  }

  // Estructuras Pikler y Madera
  if (clean.includes("Climbing Triangle") || clean.includes("Pikler") || clean.includes("Climber") || clean.includes("Rocker")) {
    return "Estructura de escalada y movimiento libre inspirada en la pedagogía Pikler. Fomenta el equilibrio, la fuerza muscular, la coordinación y la confianza corporal a su propio ritmo. Fabricada en madera natural resistente y suave al tacto.";
  }

  if (clean.includes("Balance Board") || clean.includes("Wobble Board")) {
    return "Tabla de equilibrio curva de madera natural Montessori. Estimula el sentido vestibular, la coordinación y la creatividad en el juego libre.";
  }

  // Mobiliario de madera Montessori
  if (clean.includes("Modular Montessori Wardrobe")) {
    return "Armario infantil modular diseñado bajo los principios Montessori para fomentar la autonomía, permitiendo que los niños alcancen y organicen su propia ropa de forma natural.";
  }

  if (clean.includes("Modular Montessori Shelf")) {
    return "Estantería modular infantil Montessori de madera natural, diseñada a baja altura para que los peques tengan acceso directo a sus libros y materiales educativos.";
  }

  if (clean.includes("Clothes Drying Rack") || clean.includes("drying rack")) {
    return "Tendedero de ropa infantil de madera Montessori a escala infantil, ideal para actividades de vida práctica que desarrollan la motricidad fina y la colaboración en el hogar.";
  }

  if (clean.includes("Wooden Toy Box") || clean.includes("toy box")) {
    return "Caja organizadora de juguetes de madera natural con ruedas y cuerda, perfecta para que los niños transporten y ordenen sus juguetes favoritos de forma independiente.";
  }

  if (clean.includes("Tulla Table and Chair") || clean.includes("Tulla table")) {
    return "Conjunto infantil de mesa y silla Montessori Tulla, fabricado en madera ergonómica para dibujar, leer y realizar actividades creativas a su medida.";
  }

  // Calzado y Ropa Sensorial
  if (clean.includes("TOKU Portland") || clean.includes("TOKU Rome") || clean.includes("TOKU Zurich") || clean.includes("TOKU Sneakers") || clean.includes("TOKU Sandals")) {
    return "Calzado infantil ergonómico y respetuoso, diseñado para acompañar el desarrollo natural del pie y la libertad de movimiento de los peques. Confeccionado con piel suave de primera calidad y suela flexible antideslizante.";
  }

  if (clean.includes("merino wool balaclava") || clean.includes("winter balaclava") || clean.includes("balaclava")) {
    return "Pasamontañas infantil de lana merina 100% natural, ultrasuave, térmico y transpirable. Protege la cabeza y el cuello de los peques con máxima calidez sin provocar picores.";
  }

  if (clean.includes("Baby Jumpsuit") || clean.includes("jumpsuit with hood")) {
    return "Mono infantil de algodón suave con capucha, diseñado para ofrecer máxima libertad de movimiento y comodidad en el día a día.";
  }

  // 2. Traducciones generales de frases y términos frecuentes en inglés
  clean = clean
    .replace(/Key Features/gi, "Características principales:")
    .replace(/Transformable Design/gi, "Diseño Transformable")
    .replace(/Safe & Sturdy Build/gi, "Estructura Segura y Estable")
    .replace(/Smooth & Non-Toxic Finish/gi, "Acabado Suave y No Tóxico")
    .replace(/Compact & Space-Saving/gi, "Compacto y Ahorra Espacio")
    .replace(/Easy to Clean/gi, "Fácil de Limpiar")
    .replace(/Beautiful Color Options/gi, "Opciones de Color Elegantes")
    .replace(/Sustainably Made & Designed in Europe/gi, "Diseñado y Fabricado Sosteniblemente en Europa")
    .replace(/Standing Tower Mode/gi, "Modo Torre de Observación")
    .replace(/Table & Chair Mode/gi, "Modo Mesa y Silla")
    .replace(/Weight limit/gi, "Límite de peso")
    .replace(/Height/gi, "Altura")
    .replace(/Width/gi, "Anchura")
    .replace(/Length/gi, "Longitud")
    .replace(/Depth/gi, "Profundidad")
    .replace(/First Step/gi, "Primer peldaño")
    .replace(/birch plywood/gi, "madera de abedul")
    .replace(/water-based varnish/gi, "barniz al agua ecológico")
    .replace(/completely safe for children/gi, "completamente seguro para los niños")
    .replace(/free of harsh chemicals/gi, "libre de químicos nocivos")
    .replace(/Rounded corners/gi, "Esquinas redondeadas")
    .replace(/stable structure/gi, "estructura firme y estable")
    .replace(/Encourages physical activity/gi, "Fomenta la actividad física y el movimiento")
    .replace(/Stimulates creativity and imagination/gi, "Estimula la creatividad y la imaginación")
    .replace(/Helps release excess energy/gi, "Ayuda a canalizar la energía de forma saludable")
    .replace(/Provides sensory stimulation/gi, "Proporciona estimulación sensorial equilibrada")
    .replace(/Keeps kids off screens/gi, "Fomenta el juego activo lejos de las pantallas")
    .replace(/Promotes social skills/gi, "Promueve habilidades sociales y juego compartido")
    .replace(/Highly durable: Made from HQ foam/gi, "Alta durabilidad: Espuma de alta densidad que no se deforma")
    .replace(/Easy clean: Wipe with a damp cloth/gi, "Fácil limpieza: Se limpia fácilmente con un paño húmedo")
    .replace(/Handmade with care/gi, "Elaborado a mano con acabados artesanales")
    .replace(/Made in the EU/gi, "Fabricado en la Unión Europea")
    .replace(/100% recyclable/gi, "100% reciclable")
    .replace(/Eco-leather/gi, "Piel ecológica suave y resistente")
    .replace(/Dimensions:/gi, "Dimensiones:")
    .replace(/Included:/gi, "Incluido:")
    .replace(/Includes:/gi, "Incluye:")
    .replace(/Material:/gi, "Materiales:")
    .replace(/Materials:/gi, "Materiales:")
    .replace(/Care instructions:/gi, "Instrucciones de cuidado:");

  return clean;
}

export function parseProductDescription(rawDescription: string): ParsedDescription {
  if (!rawDescription) {
    return {
      leadParagraph: "",
      badges: [],
      includedItems: [],
      features: [],
      fullTextClean: "",
    };
  }

  // 1. Normalizar y traducir al español
  const clean = normalizeToSpanish(rawDescription);

  // 2. Extraer badges automáticos según palabras clave presentes en el texto
  const badges: DescriptionBadge[] = [];
  const lowerClean = clean.toLowerCase();

  if (lowerClean.includes("oeko-tex") || lowerClean.includes("oeko tex") || lowerClean.includes("algodón")) {
    badges.push({ label: "Algodón Orgánico OEKO-TEX®", type: "oeko" });
  }
  if (lowerClean.includes("hecho a mano") || lowerClean.includes("artesanía") || lowerClean.includes("polonia") || lowerClean.includes("eu") || lowerClean.includes("unión europea") || lowerClean.includes("europa")) {
    badges.push({ label: "Artesanía de la UE", type: "handmade" });
  }
  if (lowerClean.includes("lavar") || lowerClean.includes("lavable") || lowerClean.includes("máquina") || lowerClean.includes("paño húmedo") || lowerClean.includes("limpieza")) {
    badges.push({ label: "Fácil Limpieza", type: "washable" });
  }
  if (lowerClean.includes("madera") || lowerClean.includes("postes") || lowerClean.includes("pino") || lowerClean.includes("abedul") || lowerClean.includes("fsc")) {
    badges.push({ label: "Madera Natural FSC", type: "wood" });
  }
  if (lowerClean.includes("seguridad") || lowerClean.includes("estabilizador") || lowerClean.includes("certificado") || lowerClean.includes("seguro") || lowerClean.includes("no tóxico")) {
    badges.push({ label: "Seguridad Certificada CE", type: "safety" });
  }

  // 3. Separar secciones conocidas mediante división por títulos comunes
  const sectionHeaders = [
    "Incluido:",
    "Incluye:",
    "¿Qué incluye este producto?",
    "Artesanía de la UE:",
    "Fácil mantenimiento:",
    "Fácil limpieza:",
    "Montaje rápido:",
    "Materiales:",
    "Dimensiones:",
    "Medidas:",
    "Nota:",
  ];

  // Identificar el primer párrafo de introducción (Lead Paragraph)
  let leadParagraph = clean;
  let firstHeaderIndex = clean.length;

  sectionHeaders.forEach((header) => {
    const idx = clean.indexOf(header);
    if (idx !== -1 && idx < firstHeaderIndex) {
      firstHeaderIndex = idx;
    }
  });

  if (firstHeaderIndex < clean.length) {
    leadParagraph = clean.substring(0, firstHeaderIndex).trim();
  }

  // 4. Extraer elementos incluidos si existen en la descripción
  const includedItems: string[] = [];
  const includedRegex = /(?:Incluido|Incluye|El set incluye|Contenido del paquete):\s*([^.]+)/i;
  const matchIncluded = clean.match(includedRegex);
  if (matchIncluded && matchIncluded[1]) {
    const items = matchIncluded[1]
      .split(/[,;\n•-]/)
      .map((it) => it.trim())
      .filter((it) => it.length > 2);
    includedItems.push(...items);
  }

  return {
    leadParagraph: leadParagraph || clean,
    badges,
    includedItems,
    features: [],
    fullTextClean: clean,
  };
}
