import { Response } from 'express';

class SSEManager {
  private clients: Map<string, Response[]> = new Map();

  addClient(userId: string, response: Response) {
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

  removeClient(userId: string, response: Response) {
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

  sendToUser(userId: string, data: any) {
    console.log('SSE Manager: Buscando clientes para userId:', userId);
    console.log('SSE Manager: Tipo de userId:', typeof userId);
    console.log('SSE Manager: Keys en clients map:', Array.from(this.clients.keys()));
    
    const userClients = this.clients.get(userId);
    console.log('SSE Manager: Clientes conectados para este usuario:', userClients?.length || 0);
    console.log('SSE Manager: Total clientes:', this.clients.size);
    
    if (userClients) {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      console.log('SSE Manager: Mensaje a enviar:', message.substring(0, 100) + '...');
      
      userClients.forEach(client => {
        try {
          client.write(message);
          console.log('SSE Manager: Mensaje enviado exitosamente a un cliente');
        } catch (error) {
          console.error('Error sending SSE message:', error);
          this.removeClient(userId, client);
        }
      });
    } else {
      console.log('SSE Manager: No hay clientes conectados para el usuario:', userId);
      // Intentar buscar con conversión de tipos
      console.log('SSE Manager: Intentando búsqueda con conversión de tipos...');
      for (const [key, clients] of this.clients.entries()) {
        console.log(`SSE Manager: Comparando '${key}' (${typeof key}) con '${userId}' (${typeof userId})`);
        if (String(key) === String(userId)) {
          console.log('SSE Manager: ¡Match encontrado con conversión!');
          const message = `data: ${JSON.stringify(data)}\n\n`;
          clients.forEach(client => {
            try {
              client.write(message);
            } catch (error) {
              console.error('Error sending SSE message:', error);
              this.removeClient(key, client);
            }
          });
          return;
        }
      }
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
