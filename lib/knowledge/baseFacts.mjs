// Authoritative institutional facts about Stem Care.
//
// Kept as the on-brand knowledge layer for RAG. Currently duplicated inline in
// api/chat/stream.js; a later step should make stream.js import from here so
// there is a single source of truth. Each bullet is embedded as its own
// document (metadata.source = 'stemcare') so retrieval is granular.

export const BASE_FACTS_ES = `
- Stem Care: banco privado de células madre de cordón umbilical en Guatemala (operando desde 2006).
- Procesamiento en menos de 24 horas; almacenamiento en 5 críoviales; fase de vapor de nitrógeno.
- Equipo con experiencia en recolección y trasplantes desde 2008.
- Autorizaciones MSPAS/DRACES y Colegio de Químicos Farmacéuticos; protocolos alineados a FDA/CBER.
- Cobertura 24/7 para recolección en Guatemala y El Salvador.
- Enfoque en educación del paciente y pruebas genéticas (myNewborn, myPrenatal, myHealthScore).
`.trim();

export const BASE_FACTS_EN = `
- Stem Care: private umbilical cord blood stem cell bank in Guatemala (operating since 2006).
- Processing in less than 24 hours; storage in 5 cryovials; nitrogen vapor phase.
- Team with experience in collection and transplants since 2008.
- Authorizations from MSPAS/DRACES and College of Pharmacists; protocols aligned with FDA/CBER.
- 24/7 coverage for collection in Guatemala and El Salvador.
- Focus on patient education and genetic testing (myNewborn, myPrenatal, myHealthScore).
`.trim();

/** Split a bullet block into individual "- ..." lines. */
export function bulletsOf(block) {
  return block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim());
}
