import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { SentimentoLiveEvent, SentimentoConfig } from '../types/sentimento';
import { seed003KPI } from '../kpi/seed003';

/**
 * SentimentoWSHub manages WebSocket connections for real-time sentimento events
 * Implements backpressure control and broadcasts to all connected clients
 */
export class SentimentoWSHub {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private config: SentimentoConfig;

  constructor(config: SentimentoConfig) {
    this.config = config;
  }

  /**
   * Attach the WebSocket server to an HTTP server for a specific path
   */
  attach(httpServer: HTTPServer, path: string): void {
    // Create WebSocket server without listening on its own port
    this.wss = new WebSocketServer({ noServer: true });

    // Handle upgrade requests for the specific path
    httpServer.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
      
      if (pathname === path) {
        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          this.wss!.emit('connection', ws, request);
        });
      } else {
        // Destroy socket if path doesn't match
        socket.destroy();
      }
    });

    // Handle new connections
    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    console.log(`SentimentoWSHub attached at ${path}`);
  }

  /**
   * Handle a new WebSocket connection
   */
  private handleConnection(ws: WebSocket): void {
    this.clients.add(ws);
    console.log(`New WebSocket client connected. Total clients: ${this.clients.size}`);

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(ws);
      console.log(`WebSocket client disconnected. Total clients: ${this.clients.size}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.clients.delete(ws);
    });
  }

  /**
   * Broadcast a SentimentoLiveEvent to all connected clients
   * Applies backpressure by dropping sends when bufferedAmount is too high
   */
  broadcast(event: SentimentoLiveEvent): void {
    const { hope, sorrow } = event.composites;
    
    // Feed Seed-003 KPI tracker
    seed003KPI.pushSample(hope, sorrow);

    // Prepare payload
    const payload = JSON.stringify(event);
    const bufferMaxBytes = this.config.bufferMaxKb * 1024;

    let sentCount = 0;
    let droppedCount = 0;

    // Broadcast to all clients with backpressure control
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Check backpressure: drop if buffer is too full
        if (client.bufferedAmount > bufferMaxBytes) {
          droppedCount++;
          return;
        }

        try {
          client.send(payload);
          sentCount++;
        } catch (error) {
          console.error('Error sending to WebSocket client:', error);
        }
      }
    });

    if (droppedCount > 0) {
      console.log(`Broadcast: sent to ${sentCount}, dropped ${droppedCount} due to backpressure`);
    }
  }

  /**
   * Get the number of currently connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Close all connections and shut down the WebSocket server
   */
  close(): void {
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
  }
}
