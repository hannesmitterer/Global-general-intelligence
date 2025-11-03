# GGI Broadcast Integration Guide

This guide explains how to integrate with the **GGI Broadcast** interface for distributing messages, updates, and events across the Global General Intelligence ecosystem.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Integration Methods](#integration-methods)
4. [Webhook Configuration](#webhook-configuration)
5. [Message Format](#message-format)
6. [Event Types](#event-types)
7. [Example Implementations](#example-implementations)
8. [Security](#security)
9. [Testing](#testing)

---

## Overview

**GGI Broadcast** is a message distribution system that enables:

- **Event Broadcasting**: Distribute events to multiple subscribers
- **Agent Notifications**: Notify agents about task assignments, updates
- **Status Updates**: Share system health, agent availability
- **Collaborative Workflows**: Coordinate multi-agent operations

### Key Features

- ✅ **Pub/Sub Model**: Publishers send messages to topics, subscribers receive them
- ✅ **Webhook Delivery**: HTTP POST callbacks to registered endpoints
- ✅ **Filtering**: Subscribe to specific event types or agents
- ✅ **Retry Logic**: Automatic retry with exponential backoff
- ✅ **Signature Verification**: HMAC signatures for security

---

## Architecture

```
┌─────────────┐
│  Publishers │
│  (Agents)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ GGI Broadcast   │
│   Hub           │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
    ▼         ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Agent  │ │ Agent  │ │ Webhook│ │ WebSock│
│   A    │ │   B    │ │  HTTP  │ │  WS    │
└────────┘ └────────┘ └────────┘ └────────┘
```

### Flow

1. **Publisher** sends event to GGI Broadcast Hub
2. **Hub** identifies subscribers for the event topic
3. **Delivery** occurs via webhooks, WebSocket, or polling
4. **Acknowledgment** ensures reliable delivery

---

## Integration Methods

### Method 1: REST API (Publishing)

**Endpoint:** `POST /broadcast/publish`

**Request:**
```json
{
  "topic": "task.assigned",
  "event": {
    "task_id": "task_123",
    "assigned_to": "agent_euystacio_001",
    "priority": "high"
  },
  "metadata": {
    "publisher": "nexus_coordinator",
    "timestamp": "2025-11-03T01:54:29Z"
  }
}
```

**Response:**
```json
{
  "broadcast_id": "bcast_abc123",
  "status": "published",
  "subscribers_notified": 5,
  "timestamp": "2025-11-03T01:54:30Z"
}
```

### Method 2: WebSocket (Real-time)

Connect to WebSocket endpoint:

```javascript
const ws = new WebSocket('wss://ggi-broadcast.example.com/stream?token=your-token');

ws.on('open', () => {
  // Subscribe to topics
  ws.send(JSON.stringify({
    action: 'subscribe',
    topics: ['task.assigned', 'agent.status']
  }));
});

ws.on('message', (message) => {
  const event = JSON.parse(message);
  console.log('Received event:', event);
});
```

### Method 3: Webhook (Push)

Register a webhook to receive events:

**Endpoint:** `POST /broadcast/webhooks`

**Request:**
```json
{
  "url": "https://your-agent.example.com/webhook",
  "topics": ["task.assigned", "task.completed"],
  "filters": {
    "assigned_to": "agent_euystacio_001"
  },
  "secret": "whsec_your_secret_key"
}
```

**Response:**
```json
{
  "webhook_id": "wh_xyz789",
  "status": "active",
  "created_at": "2025-11-03T01:54:29Z"
}
```

---

## Webhook Configuration

### Register Webhook

```bash
curl -X POST https://ggi-broadcast.example.com/broadcast/webhooks \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-service.com/webhook",
    "topics": ["task.*"],
    "secret": "whsec_random_secret"
  }'
```

### Webhook Endpoint Requirements

Your webhook endpoint must:

1. **Accept POST requests**
2. **Respond with HTTP 200** within 5 seconds
3. **Verify signature** (see [Security](#security))
4. **Be publicly accessible** (use ngrok for local testing)

### Example Webhook Handler (Node.js)

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.GGI_WEBHOOK_SECRET;

function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-ggi-signature'] as string;
  const rawBody = JSON.stringify(req.body);

  // Verify signature
  if (!verifySignature(rawBody, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Process event
  const event = req.body;
  console.log('Received event:', event);

  switch (event.type) {
    case 'task.assigned':
      handleTaskAssigned(event.data);
      break;
    
    case 'task.completed':
      handleTaskCompleted(event.data);
      break;

    default:
      console.log('Unknown event type:', event.type);
  }

  // Acknowledge receipt
  res.status(200).json({ received: true });
});

function handleTaskAssigned(data: any) {
  console.log('New task assigned:', data.task_id);
  // Execute task
}

function handleTaskCompleted(data: any) {
  console.log('Task completed:', data.task_id);
  // Update status
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "type": "task.assigned",
  "data": {
    "task_id": "task_123",
    "assigned_to": "agent_euystacio_001",
    "priority": "high",
    "parameters": {
      "dataset": "data_xyz"
    }
  },
  "metadata": {
    "publisher": "nexus_coordinator",
    "timestamp": "2025-11-03T01:54:29Z",
    "broadcast_id": "bcast_abc123"
  }
}
```

---

## Message Format

### Standard Event Structure

```typescript
interface GGIEvent {
  id: string;                    // Unique event ID
  type: string;                  // Event type (e.g., "task.assigned")
  data: Record<string, any>;     // Event-specific data
  metadata: {
    publisher: string;           // Publisher ID
    timestamp: string;           // ISO 8601 timestamp
    broadcast_id?: string;       // Broadcast ID (if applicable)
    correlation_id?: string;     // For tracking related events
  };
}
```

### Topic Naming Convention

Format: `<category>.<action>`

Examples:
- `task.created`
- `task.assigned`
- `task.completed`
- `task.failed`
- `agent.registered`
- `agent.status_changed`
- `agent.offline`
- `telemetry.metric`
- `system.alert`

### Wildcards

Subscribe to multiple events with wildcards:

- `task.*` - All task events
- `agent.*` - All agent events
- `*.created` - All creation events
- `*` - All events (use sparingly)

---

## Event Types

### Task Events

#### task.created
```json
{
  "type": "task.created",
  "data": {
    "task_id": "task_123",
    "name": "Process dataset",
    "type": "data_processing",
    "created_by": "usr_admin"
  }
}
```

#### task.assigned
```json
{
  "type": "task.assigned",
  "data": {
    "task_id": "task_123",
    "assigned_to": "agent_euystacio_001",
    "assigned_by": "nexus_coordinator"
  }
}
```

#### task.completed
```json
{
  "type": "task.completed",
  "data": {
    "task_id": "task_123",
    "status": "completed",
    "result": {
      "records_processed": 10000
    },
    "duration_ms": 5432
  }
}
```

### Agent Events

#### agent.registered
```json
{
  "type": "agent.registered",
  "data": {
    "agent_id": "agent_new_001",
    "name": "New Agent",
    "capabilities": ["text_analysis"]
  }
}
```

#### agent.status_changed
```json
{
  "type": "agent.status_changed",
  "data": {
    "agent_id": "agent_euystacio_001",
    "old_status": "active",
    "new_status": "degraded",
    "reason": "High CPU usage"
  }
}
```

### System Events

#### system.alert
```json
{
  "type": "system.alert",
  "data": {
    "severity": "warning",
    "message": "Database connection pool near capacity",
    "details": {
      "current_connections": 95,
      "max_connections": 100
    }
  }
}
```

---

## Example Implementations

### Example 1: Publishing Task Events

```typescript
import axios from 'axios';

async function publishTaskCreated(task: any) {
  await axios.post('https://ggi-broadcast.example.com/broadcast/publish', {
    topic: 'task.created',
    event: {
      task_id: task.id,
      name: task.name,
      type: task.type
    },
    metadata: {
      publisher: 'task_manager',
      timestamp: new Date().toISOString()
    }
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.GGI_API_KEY}`
    }
  });
}
```

### Example 2: Subscribing via Polling

```typescript
async function pollEvents() {
  const response = await axios.get(
    'https://ggi-broadcast.example.com/broadcast/events',
    {
      params: {
        topics: 'task.assigned',
        since: lastEventTimestamp
      },
      headers: {
        'Authorization': `Bearer ${process.env.GGI_API_KEY}`
      }
    }
  );

  const events = response.data.events;
  events.forEach(handleEvent);

  // Update last seen timestamp
  if (events.length > 0) {
    lastEventTimestamp = events[events.length - 1].metadata.timestamp;
  }
}

// Poll every 5 seconds
setInterval(pollEvents, 5000);
```

### Example 3: Multi-Agent Coordination

```typescript
// Agent A: Publishes data ready event
await axios.post('https://ggi-broadcast.example.com/broadcast/publish', {
  topic: 'data.ready',
  event: {
    dataset_id: 'ds_xyz',
    format: 'parquet',
    location: 's3://bucket/dataset.parquet'
  },
  metadata: {
    publisher: 'agent_a',
    timestamp: new Date().toISOString()
  }
});

// Agent B: Webhook receives event
app.post('/webhook', (req, res) => {
  const event = req.body;
  
  if (event.type === 'data.ready') {
    // Download and process dataset
    processDataset(event.data.location);
  }
  
  res.status(200).send('OK');
});
```

---

## Security

### HMAC Signature Verification

All webhooks include an `X-GGI-Signature` header:

```
X-GGI-Signature: sha256=abc123def456...
```

**Verification (Node.js):**

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Usage
const rawBody = JSON.stringify(req.body);
const signature = req.headers['x-ggi-signature'];
const isValid = verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);
```

### Best Practices

1. **Always verify signatures**: Reject requests with invalid signatures
2. **Use HTTPS**: Never expose webhook endpoints over HTTP
3. **Rotate secrets**: Periodically update webhook secrets
4. **Rate limiting**: Prevent abuse with rate limits on webhook endpoints
5. **Idempotency**: Handle duplicate events gracefully (use `event.id`)

---

## Testing

### Test with cURL

```bash
# Publish event
curl -X POST https://ggi-broadcast.example.com/broadcast/publish \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test.event",
    "event": {"message": "Hello, GGI!"},
    "metadata": {"publisher": "test", "timestamp": "2025-11-03T01:54:29Z"}
  }'
```

### Test Webhook Locally with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your webhook server: `npm run dev`
3. Expose local server: `ngrok http 3000`
4. Register webhook with ngrok URL: `https://abc123.ngrok.io/webhook`
5. Trigger events and monitor ngrok dashboard

### Mock Webhook Payload

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-GGI-Signature: sha256=test-signature" \
  -d '{
    "id": "evt_test123",
    "type": "task.assigned",
    "data": {"task_id": "task_123"},
    "metadata": {"publisher": "test", "timestamp": "2025-11-03T01:54:29Z"}
  }'
```

---

## Retry Logic

### Webhook Delivery Retry

GGI Broadcast automatically retries failed webhook deliveries:

| Attempt | Delay     | Total Time |
|---------|-----------|------------|
| 1       | Immediate | 0s         |
| 2       | 1s        | 1s         |
| 3       | 5s        | 6s         |
| 4       | 25s       | 31s        |
| 5       | 125s      | 156s       |

**Failure Conditions:**
- HTTP status ≠ 2xx
- Connection timeout (> 5s)
- Network error

After 5 failed attempts, the webhook is marked as **failed** and must be manually retried.

### Manual Retry

```bash
curl -X POST https://ggi-broadcast.example.com/broadcast/retry \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"event_id": "evt_abc123", "webhook_id": "wh_xyz789"}'
```

---

## Monitoring & Debugging

### Webhook Logs

Retrieve webhook delivery logs:

```bash
curl https://ggi-broadcast.example.com/broadcast/webhooks/wh_xyz789/logs \
  -H "Authorization: Bearer your-api-key"
```

**Response:**
```json
{
  "webhook_id": "wh_xyz789",
  "logs": [
    {
      "event_id": "evt_abc123",
      "attempt": 1,
      "status": 200,
      "latency_ms": 145,
      "timestamp": "2025-11-03T01:54:30Z"
    },
    {
      "event_id": "evt_def456",
      "attempt": 1,
      "status": 500,
      "error": "Internal Server Error",
      "timestamp": "2025-11-03T02:00:00Z"
    }
  ]
}
```

### Health Check

```bash
curl https://ggi-broadcast.example.com/broadcast/health \
  -H "Authorization: Bearer your-api-key"
```

**Response:**
```json
{
  "status": "healthy",
  "webhooks": {
    "total": 12,
    "active": 10,
    "failed": 2
  },
  "events_published_last_hour": 1234
}
```

---

## Environment Variables

```bash
# GGI Broadcast Configuration
GGI_BROADCAST_URL=https://ggi-broadcast.example.com
GGI_API_KEY=ggi_sk_live_abc123xyz

# Webhook Configuration
GGI_WEBHOOK_URL=https://your-service.com/webhook
GGI_WEBHOOK_SECRET=whsec_random_secret_here

# Optional: Polling interval (if not using webhooks)
GGI_POLL_INTERVAL_MS=5000
```

---

## Additional Resources

- [GGI Broadcast API Docs](https://docs.ggi-broadcast.example.com)
- [Webhook Best Practices](https://webhooks.fyi/)
- [HMAC Signatures](https://en.wikipedia.org/wiki/HMAC)

---

**Need help?** Open an issue: https://github.com/hannesmitterer/Global-general-intelligence/issues
