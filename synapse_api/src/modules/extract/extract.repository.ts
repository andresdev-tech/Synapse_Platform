export class ExtractRepository {
  /**
   * Realiza la petición HTTP externa para obtener el recurso remoto.
   */
  static async fetchResource(url: string): Promise<Response> {
    return await fetch(url, {
      headers: {
        "User-Agent": "Synapse-Bot/1.0",
      },
    });
  }
}
