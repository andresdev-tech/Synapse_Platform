import { Response } from 'express';

class SSEManager {
  private clients: Map<number, Response[]> = new Map();

  addClient(userId: number, response: Response) {
    // Configurar headers SSE
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    // Enviar evento de conexión inicial
    response.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conectado al chatbot en tiempo real' })}\n\n`);

    // Agregar cliente
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(response);
  }

  removeClient(userId: number, response: Response) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.indexOf(response);
      if (index > -1) {
        userClients.splice(index, 1);
      }
      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  sendToUser(userId: number, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      userClients.forEach(client => {
        try {
          client.write(message);
        } catch (error) {
          console.error('Error sending SSE message:', error);
          this.removeClient(userId, client);
        }
      });
    }
  }

  broadcast(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((clients) => {
      clients.forEach(client => {
        try {
          client.write(message);
        } catch (error) {
          console.error('Error broadcasting SSE message:', error);
        }
      });
    });
  }
}

export const sseManager = new SSEManager();
