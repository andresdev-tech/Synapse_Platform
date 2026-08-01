import { prisma } from "../../../config/prisma";

export async function searchDocuments(query: string) {
    const documents = await prisma.documentos_rag.findMany({
        where: {
            contenido: {
                contains: query
            }
        }
    });
    return documents;
}
