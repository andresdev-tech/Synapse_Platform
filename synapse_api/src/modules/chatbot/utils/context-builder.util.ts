export function buildContext(
  documents: {
    titulo: string;
    tipo: string;
    contenido: string;
  }[]
): string {
  if (!documents.length) {
    return "No se encontró información relacionada.";
  }

  return documents
    .map(
      (doc) => `
Título: ${doc.titulo}

Contenido:
${doc.contenido}
`
    )
    .join("\n\n");
}