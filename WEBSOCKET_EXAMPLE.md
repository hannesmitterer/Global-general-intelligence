# WebSocket Example - Node.js Implementation

This guide provides a complete example of implementing WebSocket bidirectional messaging for the Nexus API.

---

## Table of Contents

1. [Overview](#overview)
2. [Server Implementation](#server-implementation)
3. [Client Implementation](#client-implementation)
4. [Message Protocol](#message-protocol)
5. [Authentication](#authentication)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Overview

WebSockets enable real-time, bidirectional communication between clients and servers. This is essential for:

- Real-time telemetry streaming
- Live task status updates
- Multi-agent collaboration
- Event notifications

### Features

- ✅ Automatic reconnection with exponential backoff
- ✅ Heartbeat/ping-pong for connection health
- ✅ Message queuing for offline periods
- ✅ Authentication via JWT tokens
- ✅ Room-based broadcasting

---

## Server Implementation

### Install Dependencies

```bash
npm install ws express jsonwebtoken
npm install --save-dev @types/ws @types/jsonwebtoken
```

### Server Code

**`src/websocket-server.ts`**:

```typescript
import WebSocket from 'ws';
import { createServer } from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const JWT_SECRET = process.env.NEXUS_JWT_SECRET || 'your-secret-key';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Store active connections
interface Client {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
  subscriptions: Set<string>;
}

const clients = new Map<WebSocket, Client>();

// Verify JWT token
function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch (error) {
    return null;
  }
}

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url!, `http://${request.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request, user);
  });
});

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, request: any, user: { userId: string }) => {
  console.log(`Client connected: ${user.userId}`);

  // Initialize client
  const client: Client = {
    ws,
    userId: user.userId,
    isAlive: true,
    subscriptions: new Set()
  };
  clients.set(ws, client);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to Nexus WebSocket',
    userId: user.userId
  }));

  // Handle incoming messages
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      handleMessage(client, data);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON format'
      }));
    }
  });

  // Handle pong (heartbeat response)
  ws.on('pong', () => {
    client.isAlive = true;
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${user.userId}`);
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for ${user.userId}:`, error);
  });
});

// Message handler
function handleMessage(client: Client, data: any) {
  const { action, channel, filters, payload } = data;

  switch (action) {
    case 'subscribe':
      handleSubscribe(client, channel, filters);
      break;

    case 'unsubscribe':
      handleUnsubscribe(client, channel);
      break;

    case 'publish':
      handlePublish(client, channel, payload);
      break;

    case 'ping':
      client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    default:
      client.ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown action: ${action}`
      }));
  }
}

// Subscribe to channel
function handleSubscribe(client: Client, channel: string, filters?: any) {
  const subscriptionKey = `${channel}:${JSON.stringify(filters || {})}`;
  client.subscriptions.add(subscriptionKey);

  client.ws.send(JSON.stringify({
    type: 'subscribed',
    channel,
    filters
  }));

  console.log(`${client.userId} subscribed to ${subscriptionKey}`);
}

// Unsubscribe from channel
function handleUnsubscribe(client: Client, channel: string) {
  for (const sub of client.subscriptions) {
    if (sub.startsWith(`${channel}:`)) {
      client.subscriptions.delete(sub);
    }
  }

  client.ws.send(JSON.stringify({
    type: 'unsubscribed',
    channel
  }));
}

// Publish to channel
function handlePublish(client: Client, channel: string, payload: any) {
  const message = JSON.stringify({
    type: 'message',
    channel,
    from: client.userId,
    data: payload,
    timestamp: new Date().toISOString()
  });

  // Broadcast to all subscribed clients
  clients.forEach((otherClient, ws) => {
    if (otherClient.subscriptions.has(`${channel}:{}`)) {
      ws.send(message);
    }
  });
}

// Broadcast to all clients in a channel
export function broadcast(channel: string, data: any) {
  const message = JSON.stringify({
    type: 'broadcast',
    channel,
    data,
    timestamp: new Date().toISOString()
  });

  clients.forEach((client, ws) => {
    if (client.subscriptions.has(`${channel}:{}`)) {
      ws.send(message);
    }
  });
}

// Heartbeat to detect broken connections
const heartbeat = setInterval(() => {
  clients.forEach((client, ws) => {
    if (!client.isAlive) {
      console.log(`Terminating dead connection: ${client.userId}`);
      ws.terminate();
      clients.delete(ws);
      return;
    }

    client.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
  clearInterval(heartbeat);
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Example: Broadcast telemetry data
setInterval(() => {
  broadcast('telemetry', {
    metric: 'system_health',
    value: Math.random() * 100
  });
}, 5000);
```

---

## Client Implementation

### Browser Client (JavaScript)

**`client.js`**:

```javascript
class NexusWebSocket {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.subscriptions = new Set();
    this.messageQueue = [];
    this.listeners = new Map();
  }

  connect() {
    const wsUrl = `${this.url}?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to Nexus WebSocket');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      // Flush message queue
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.ws.send(JSON.stringify(message));
      }

      // Re-subscribe to channels
      this.subscriptions.forEach(channel => {
        this.send({ action: 'subscribe', channel });
      });

      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from Nexus WebSocket');
      this.emit('disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  subscribe(channel, filters = {}) {
    this.subscriptions.add(channel);
    this.send({ action: 'subscribe', channel, filters });
  }

  unsubscribe(channel) {
    this.subscriptions.delete(channel);
    this.send({ action: 'unsubscribe', channel });
  }

  publish(channel, payload) {
    this.send({ action: 'publish', channel, payload });
  }

  handleMessage(data) {
    const { type, channel, data: payload } = data;

    switch (type) {
      case 'connected':
      case 'subscribed':
      case 'unsubscribed':
        console.log(data.message || `${type}: ${channel}`);
        break;

      case 'message':
      case 'broadcast':
        this.emit(channel, payload);
        break;

      case 'pong':
        // Heartbeat response
        break;

      case 'error':
        console.error('Server error:', data.message);
        this.emit('error', data);
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage Example
const client = new NexusWebSocket('wss://nexus-api.onrender.com/ws', 'your-jwt-token');

client.on('connected', () => {
  console.log('Successfully connected!');
  
  // Subscribe to telemetry channel
  client.subscribe('telemetry', { agent_id: 'agent_euystacio_001' });
});

client.on('telemetry', (data) => {
  console.log('Telemetry received:', data);
  // Update UI with telemetry data
});

client.on('error', (error) => {
  console.error('Connection error:', error);
});

client.connect();
```

### Node.js Client

**`node-client.ts`**:

```typescript
import WebSocket from 'ws';

interface Message {
  action: string;
  channel?: string;
  payload?: any;
  filters?: any;
}

class NexusWSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  connect() {
    this.ws = new WebSocket(`${this.url}?token=${this.token}`);

    this.ws.on('open', () => {
      console.log('Connected to Nexus WebSocket');
      
      // Subscribe to channels
      this.subscribe('telemetry');
    });

    this.ws.on('message', (data: string) => {
      const message = JSON.parse(data.toString());
      console.log('Received:', message);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('Connection closed');
    });
  }

  send(message: Message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(channel: string, filters?: any) {
    this.send({ action: 'subscribe', channel, filters });
  }

  publish(channel: string, payload: any) {
    this.send({ action: 'publish', channel, payload });
  }

  disconnect() {
    this.ws?.close();
  }
}

// Usage
const client = new NexusWSClient('wss://nexus-api.onrender.com/ws', 'your-token');
client.connect();
```

---

## Message Protocol

### Client → Server Messages

#### Subscribe to Channel
```json
{
  "action": "subscribe",
  "channel": "telemetry",
  "filters": {
    "agent_id": "agent_euystacio_001"
  }
}
```

#### Unsubscribe from Channel
```json
{
  "action": "unsubscribe",
  "channel": "telemetry"
}
```

#### Publish Message
```json
{
  "action": "publish",
  "channel": "commands",
  "payload": {
    "command": "execute_task",
    "task_id": "task_123"
  }
}
```

#### Ping (Heartbeat)
```json
{
  "action": "ping"
}
```

### Server → Client Messages

#### Connection Confirmation
```json
{
  "type": "connected",
  "message": "Welcome to Nexus WebSocket",
  "userId": "usr_123"
}
```

#### Subscription Confirmation
```json
{
  "type": "subscribed",
  "channel": "telemetry",
  "filters": { "agent_id": "agent_euystacio_001" }
}
```

#### Broadcast Message
```json
{
  "type": "broadcast",
  "channel": "telemetry",
  "data": {
    "agent_id": "agent_euystacio_001",
    "cpu_usage": 45.2
  },
  "timestamp": "2025-11-03T01:54:29Z"
}
```

#### Error
```json
{
  "type": "error",
  "message": "Invalid JSON format"
}
```

---

## Authentication

### JWT Token Authentication

Include token in WebSocket connection URL:

```javascript
const ws = new WebSocket('wss://nexus-api.onrender.com/ws?token=eyJhbGciOi...');
```

### Token Validation on Server

```typescript
import jwt from 'jsonwebtoken';

const user = jwt.verify(token, JWT_SECRET);
if (!user) {
  socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
  socket.destroy();
}
```

---

## Error Handling

### Connection Errors

```javascript
client.on('error', (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.error('Server is not reachable');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('Connection timeout');
  }
});
```

### Automatic Reconnection

Implemented with exponential backoff in client code (see Client Implementation).

---

## Testing

### Test with `wscat`

Install `wscat`:
```bash
npm install -g wscat
```

Connect to server:
```bash
wscat -c "wss://nexus-api.onrender.com/ws?token=your-jwt-token"
```

Send subscribe message:
```json
{"action":"subscribe","channel":"telemetry"}
```

### Integration Test

**`test/websocket.test.ts`**:

```typescript
import WebSocket from 'ws';

describe('WebSocket Server', () => {
  let ws: WebSocket;

  beforeAll((done) => {
    ws = new WebSocket('ws://localhost:8080?token=test-token');
    ws.on('open', done);
  });

  afterAll(() => {
    ws.close();
  });

  test('should connect successfully', (done) => {
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      expect(message.type).toBe('connected');
      done();
    });
  });

  test('should subscribe to channel', (done) => {
    ws.send(JSON.stringify({ action: 'subscribe', channel: 'test' }));
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'subscribed') {
        expect(message.channel).toBe('test');
        done();
      }
    });
  });
});
```

---

## Best Practices

1. **Always authenticate**: Never allow unauthenticated WebSocket connections
2. **Implement heartbeat**: Detect and close broken connections
3. **Handle reconnection**: Clients should automatically reconnect with backoff
4. **Queue messages**: Buffer messages when offline
5. **Validate input**: Always validate incoming messages
6. **Limit message size**: Prevent DoS attacks with large payloads
7. **Use compression**: Enable per-message deflate for efficiency

---

## Performance Tuning

### Server Configuration

```typescript
const wss = new WebSocket.Server({
  noServer: true,
  perMessageDeflate: true,
  maxPayload: 1024 * 1024, // 1 MB max message size
  clientTracking: true
});
```

### Load Balancing

For multiple server instances, use Redis Pub/Sub:

```typescript
import Redis from 'ioredis';

const redisPub = new Redis(process.env.REDIS_URL);
const redisSub = new Redis(process.env.REDIS_URL);

// Subscribe to Redis channel
redisSub.subscribe('nexus:broadcast');

redisSub.on('message', (channel, message) => {
  // Broadcast to local WebSocket clients
  broadcast('telemetry', JSON.parse(message));
});

// Publish to Redis (reaches all server instances)
function publishToRedis(channel: string, data: any) {
  redisPub.publish('nexus:broadcast', JSON.stringify(data));
}
```

---

## Additional Resources

- [WebSocket MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [ws Library Documentation](https://github.com/websockets/ws)
- [RFC 6455 - WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

---

**Need help?** Open an issue: https://github.com/hannesmitterer/Global-general-intelligence/issues
