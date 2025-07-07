// File 102: lib/sse.ts - Server-Sent Events for Real-time Updates
export class SSEManager {
    private connections = new Map<string, Response>();
  
    addConnection(userId: string, response: Response) {
      this.connections.set(userId, response);
    }
  
    removeConnection(userId: string) {
      this.connections.delete(userId);
    }
  
    sendToUser(userId: string, data: any) {
      const connection = this.connections.get(userId);
      if (connection) {
        const encoder = new TextEncoder();
        const formattedData = `data: ${JSON.stringify(data)}\n\n`;
        connection.body?.getWriter().write(encoder.encode(formattedData));
      }
    }
  
    broadcast(data: any) {
      this.connections.forEach((connection) => {
        const encoder = new TextEncoder();
        const formattedData = `data: ${JSON.stringify(data)}\n\n`;
        connection.body?.getWriter().write(encoder.encode(formattedData));
      });
    }
  }