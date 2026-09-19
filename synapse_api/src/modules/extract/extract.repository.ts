/**
 * Repositorio para la realización de peticiones HTTP externas.
 * Permite descargar páginas HTML o recursos remotos para su procesamiento.
 */
export class ExtractRepository {
  /**
   * Realiza la petición HTTP externa para obtener el recurso remoto usando el User-Agent institucional.
   */
  static async fetchResource(url: string): Promise<Response> {
    return await fetch(url, {
      headers: {
        "User-Agent": "Synapse-Bot/1.0",
      },
    });
  }
}

