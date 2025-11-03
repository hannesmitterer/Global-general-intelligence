# Nexus API Specification

**Version:** 1.0.0  
**Last Updated:** 2025-11-03

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Telemetry API](#telemetry-api)
5. [Command API](#command-api)
6. [Task Management API](#task-management-api)
7. [AI Coordination API](#ai-coordination-api)
8. [Security & Privacy](#security--privacy)
9. [Event System](#event-system)
10. [Error Handling](#error-handling)
11. [Example Workflows](#example-workflows)

---

## Overview

The **Nexus API** is a comprehensive interface for coordinating distributed AI agents, managing tasks, collecting telemetry, and facilitating real-time communication across the Global General Intelligence (GGI) ecosystem.

### Key Features

- **Telemetry Collection**: Real-time metrics, logs, and system health data
- **Command & Control**: Bidirectional command execution and status tracking
- **Task Management**: CRUD operations for distributed task orchestration
- **AI Coordination**: Agent discovery, capability negotiation, and collaborative workflows
- **Security**: OAuth 2.0, API keys, role-based access control (RBAC)
- **Event Streaming**: WebSocket and Server-Sent Events (SSE) for real-time updates

### Design Principles

- **RESTful**: HTTP methods map to CRUD operations
- **Real-time**: WebSocket support for bidirectional streaming
- **Secure by Default**: All endpoints require authentication
- **Idempotent**: Safe retry semantics for critical operations
- **Extensible**: Modular design supporting plugins and custom handlers

---

## Architecture

### System Components

```
┌─────────────────┐
│   AI Agents     │
│  (Euystacio,    │
│   ALO-001, etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nexus Gateway  │ ◄── REST/WebSocket/gRPC
│  (Load Balancer)│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ API    │ │ Event  │
│ Server │ │ Broker │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         ▼
   ┌──────────┐
   │ Database │
   │ (State)  │
   └──────────┘
```

### Protocols

- **REST**: Primary interface for CRUD operations (HTTP/1.1, HTTP/2)
- **WebSocket**: Real-time bidirectional messaging (RFC 6455)
- **gRPC**: High-performance telemetry ingestion (Protocol Buffers)
- **SSE**: Server-to-client event streaming

---

## Authentication & Authorization

### Supported Methods

1. **OAuth 2.0 (Google)**: For user-facing applications
2. **API Keys**: For service-to-service communication
3. **JWT Tokens**: Short-lived session tokens

### OAuth 2.0 Flow

```http
POST /auth/oauth/google
Content-Type: application/json

{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5..."
}
```

**Response:**
```json
{
  "access_token": "nexus_at_...",
  "refresh_token": "nexus_rt_...",
  "expires_in": 3600,
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "role": "seedbringer"
  }
}
```

### API Key Authentication

Include in headers:
```http
Authorization: Bearer nexus_sk_live_...
```

### Role-Based Access Control (RBAC)

| Role         | Permissions                          |
|--------------|--------------------------------------|
| `seedbringer`| Full access (read + write + admin)   |
| `council`    | Read-only access                     |
| `agent`      | Telemetry write, task read           |
| `observer`   | Telemetry read, event subscribe      |

---

## Telemetry API

### POST /telemetry/metrics

Submit real-time metrics from agents.

**Request:**
```json
{
  "agent_id": "agent_euystacio_001",
  "timestamp": "2025-11-03T01:54:29Z",
  "metrics": {
    "cpu_usage": 45.2,
    "memory_mb": 1024,
    "active_tasks": 3,
    "response_time_ms": 120
  },
  "tags": {
    "environment": "production",
    "region": "us-east-1"
  }
}
```

**Response:**
```json
{
  "status": "accepted",
  "metric_id": "met_abc123",
  "stored_at": "2025-11-03T01:54:30Z"
}
```

### POST /telemetry/logs

Submit structured logs.

**Request:**
```json
{
  "agent_id": "agent_alo001",
  "level": "info",
  "message": "Task completed successfully",
  "timestamp": "2025-11-03T01:54:29Z",
  "context": {
    "task_id": "task_xyz",
    "duration_ms": 5432
  }
}
```

### GET /telemetry/health

Retrieve system health status.

**Response:**
```json
{
  "status": "healthy",
  "agents": {
    "total": 12,
    "active": 10,
    "degraded": 2,
    "offline": 0
  },
  "system": {
    "uptime_seconds": 86400,
    "total_requests": 1234567,
    "avg_response_ms": 95
  }
}
```

### WebSocket: /telemetry/stream

Real-time telemetry streaming.

**Connect:**
```javascript
const ws = new WebSocket('wss://nexus.example.com/telemetry/stream?token=nexus_at_...');
```

**Subscribe:**
```json
{
  "action": "subscribe",
  "channels": ["metrics", "logs"],
  "filters": {
    "agent_id": "agent_euystacio_001"
  }
}
```

**Receive:**
```json
{
  "channel": "metrics",
  "data": {
    "agent_id": "agent_euystacio_001",
    "cpu_usage": 52.1
  },
  "timestamp": "2025-11-03T01:54:35Z"
}
```

---

## Command API

### POST /commands

Issue a command to an agent.

**Request:**
```json
{
  "agent_id": "agent_euystacio_001",
  "command": "execute_task",
  "parameters": {
    "task_id": "task_123",
    "priority": "high"
  },
  "timeout_seconds": 300,
  "idempotency_key": "cmd_unique_123"
}
```

**Response:**
```json
{
  "command_id": "cmd_abc123",
  "status": "queued",
  "created_at": "2025-11-03T01:54:29Z",
  "eta_seconds": 5
}
```

### GET /commands/{command_id}

Retrieve command status.

**Response:**
```json
{
  "command_id": "cmd_abc123",
  "status": "completed",
  "result": {
    "success": true,
    "output": "Task executed successfully",
    "duration_ms": 4523
  },
  "completed_at": "2025-11-03T01:54:34Z"
}
```

### PATCH /commands/{command_id}

Update command (e.g., cancel).

**Request:**
```json
{
  "status": "cancelled",
  "reason": "User requested cancellation"
}
```

### Supported Commands

| Command           | Description                        | Required Params        |
|-------------------|------------------------------------|------------------------|
| `execute_task`    | Run a specific task                | `task_id`              |
| `update_config`   | Update agent configuration         | `config_key`, `value`  |
| `restart`         | Restart agent                      | None                   |
| `health_check`    | Trigger health check               | None                   |
| `sync_state`      | Synchronize state with coordinator | None                   |

---

## Task Management API

### POST /tasks

Create a new task.

**Request:**
```json
{
  "name": "Process dataset XYZ",
  "type": "data_processing",
  "priority": "high",
  "assigned_to": "agent_euystacio_001",
  "parameters": {
    "dataset_id": "ds_xyz",
    "operations": ["normalize", "classify"]
  },
  "dependencies": ["task_abc"],
  "deadline": "2025-11-04T00:00:00Z"
}
```

**Response:**
```json
{
  "task_id": "task_new123",
  "status": "pending",
  "created_at": "2025-11-03T01:54:29Z",
  "estimated_duration_seconds": 3600
}
```

### GET /tasks

List tasks with filters.

**Query Parameters:**
- `status`: Filter by status (`pending`, `in_progress`, `completed`, `failed`)
- `assigned_to`: Filter by agent ID
- `priority`: Filter by priority level
- `limit`: Max results (default: 50, max: 200)
- `offset`: Pagination offset

**Response:**
```json
{
  "tasks": [
    {
      "task_id": "task_123",
      "name": "Process dataset XYZ",
      "status": "in_progress",
      "progress_percent": 65,
      "assigned_to": "agent_euystacio_001"
    }
  ],
  "total": 142,
  "limit": 50,
  "offset": 0
}
```

### GET /tasks/{task_id}

Retrieve task details.

**Response:**
```json
{
  "task_id": "task_123",
  "name": "Process dataset XYZ",
  "status": "completed",
  "result": {
    "records_processed": 10000,
    "accuracy": 0.95
  },
  "timeline": {
    "created_at": "2025-11-03T00:00:00Z",
    "started_at": "2025-11-03T00:05:00Z",
    "completed_at": "2025-11-03T01:54:00Z"
  }
}
```

### PATCH /tasks/{task_id}

Update task status or parameters.

**Request:**
```json
{
  "status": "in_progress",
  "progress_percent": 75,
  "notes": "Processing batch 7 of 10"
}
```

### DELETE /tasks/{task_id}

Cancel and remove a task (if permitted).

**Response:**
```json
{
  "status": "deleted",
  "task_id": "task_123"
}
```

---

## AI Coordination API

### GET /agents

Discover available agents.

**Response:**
```json
{
  "agents": [
    {
      "agent_id": "agent_euystacio_001",
      "name": "Euystacio",
      "status": "active",
      "capabilities": ["data_processing", "classification"],
      "load_percent": 45,
      "last_seen": "2025-11-03T01:54:20Z"
    },
    {
      "agent_id": "agent_alo001",
      "name": "ALO-001",
      "status": "active",
      "capabilities": ["authentication", "authorization"],
      "load_percent": 12,
      "last_seen": "2025-11-03T01:54:25Z"
    }
  ]
}
```

### POST /agents/register

Register a new agent.

**Request:**
```json
{
  "agent_id": "agent_custom_002",
  "name": "Custom Agent",
  "capabilities": ["custom_task"],
  "endpoint": "https://agent.example.com/api",
  "auth_token": "agent_token_..."
}
```

### POST /coordination/negotiate

Negotiate capabilities for multi-agent tasks.

**Request:**
```json
{
  "task_type": "collaborative_analysis",
  "required_capabilities": ["data_processing", "ml_inference"],
  "preferred_agents": ["agent_euystacio_001"],
  "constraints": {
    "max_latency_ms": 1000,
    "min_accuracy": 0.9
  }
}
```

**Response:**
```json
{
  "negotiation_id": "neg_abc123",
  "assigned_agents": [
    {
      "agent_id": "agent_euystacio_001",
      "role": "primary",
      "capabilities_matched": ["data_processing"]
    },
    {
      "agent_id": "agent_ml_003",
      "role": "secondary",
      "capabilities_matched": ["ml_inference"]
    }
  ],
  "estimated_completion": "2025-11-03T02:30:00Z"
}
```

### WebSocket: /coordination/collaborate

Real-time multi-agent collaboration channel.

**Message Format:**
```json
{
  "session_id": "collab_xyz",
  "from_agent": "agent_euystacio_001",
  "to_agents": ["agent_ml_003"],
  "message_type": "data_share",
  "payload": {
    "dataset_ref": "ds_interim_results",
    "format": "parquet"
  }
}
```

---

## Security & Privacy

### Rate Limiting

| Endpoint Category | Limit               | Window  |
|-------------------|---------------------|---------|
| Authentication    | 10 requests         | 1 minute|
| Telemetry         | 1000 requests       | 1 minute|
| Commands          | 100 requests        | 1 minute|
| Tasks             | 500 requests        | 1 minute|

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1699056900
```

### Data Encryption

- **In Transit**: TLS 1.3 required for all connections
- **At Rest**: AES-256 encryption for sensitive data
- **Secrets**: Stored in environment variables or secret managers (AWS Secrets Manager, HashiCorp Vault)

### Session Management

- **Access Tokens**: 1-hour expiration
- **Refresh Tokens**: 30-day expiration
- **Session Cleanup**: Automatic cleanup of expired sessions every 15 minutes

### Privacy Considerations

- **Data Minimization**: Only collect necessary telemetry
- **Anonymization**: PII automatically redacted in logs
- **Audit Logs**: All access logged with user ID, timestamp, action

---

## Event System

### Server-Sent Events (SSE)

Connect to receive real-time events:

```http
GET /events/stream
Accept: text/event-stream
Authorization: Bearer nexus_at_...
```

**Event Types:**
```
event: task.created
data: {"task_id": "task_123", "name": "New Task"}

event: agent.status_changed
data: {"agent_id": "agent_001", "status": "degraded"}

event: command.completed
data: {"command_id": "cmd_abc", "status": "success"}
```

### Webhooks

Register webhook endpoints for events:

**POST /webhooks**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["task.completed", "agent.offline"],
  "secret": "whsec_..."
}
```

**Webhook Payload:**
```json
{
  "id": "evt_abc123",
  "type": "task.completed",
  "created_at": "2025-11-03T01:54:29Z",
  "data": {
    "task_id": "task_123",
    "status": "completed"
  }
}
```

**Signature Verification:**
```http
X-Nexus-Signature: sha256=...
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Missing required parameter: agent_id",
    "details": {
      "param": "agent_id",
      "location": "body"
    },
    "request_id": "req_abc123"
  }
}
```

### Error Codes

| Code                  | HTTP Status | Description                        |
|-----------------------|-------------|------------------------------------|
| `invalid_request`     | 400         | Malformed request                  |
| `unauthorized`        | 401         | Invalid or missing credentials     |
| `forbidden`           | 403         | Insufficient permissions           |
| `not_found`           | 404         | Resource not found                 |
| `conflict`            | 409         | Resource conflict (e.g., duplicate)|
| `rate_limited`        | 429         | Too many requests                  |
| `internal_error`      | 500         | Server error                       |
| `service_unavailable` | 503         | Temporary service unavailability   |

### Retry Strategy

- **Idempotent Requests**: Safe to retry (GET, PUT, DELETE)
- **Non-Idempotent**: Use `idempotency_key` header
- **Backoff**: Exponential backoff (1s, 2s, 4s, 8s)
- **Max Retries**: 3 attempts

---

## Example Workflows

### Workflow 1: Agent Registration and Task Execution

```javascript
// 1. Authenticate
const authResponse = await fetch('https://nexus.example.com/auth/oauth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id_token: googleIdToken })
});
const { access_token } = await authResponse.json();

// 2. Register Agent
await fetch('https://nexus.example.com/agents/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: 'agent_custom_001',
    capabilities: ['text_analysis']
  })
});

// 3. Create Task
const taskResponse = await fetch('https://nexus.example.com/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Analyze document',
    type: 'text_analysis',
    assigned_to: 'agent_custom_001',
    parameters: { document_id: 'doc_123' }
  })
});
const { task_id } = await taskResponse.json();

// 4. Poll Task Status
let completed = false;
while (!completed) {
  const status = await fetch(`https://nexus.example.com/tasks/${task_id}`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  const task = await status.json();
  completed = task.status === 'completed';
  if (!completed) await new Promise(r => setTimeout(r, 5000));
}
```

### Workflow 2: Real-Time Telemetry Monitoring

```javascript
// WebSocket connection
const ws = new WebSocket('wss://nexus.example.com/telemetry/stream?token=' + access_token);

ws.onopen = () => {
  // Subscribe to specific agent metrics
  ws.send(JSON.stringify({
    action: 'subscribe',
    channels: ['metrics'],
    filters: { agent_id: 'agent_euystacio_001' }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Metric received:', data);
  
  // Alert if CPU usage exceeds threshold
  if (data.data.cpu_usage > 90) {
    alert('High CPU usage detected!');
  }
};
```

### Workflow 3: Multi-Agent Collaboration

```javascript
// 1. Negotiate capabilities
const negotiation = await fetch('https://nexus.example.com/coordination/negotiate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    task_type: 'collaborative_analysis',
    required_capabilities: ['data_processing', 'ml_inference']
  })
});
const { negotiation_id, assigned_agents } = await negotiation.json();

// 2. Create collaborative session
const session = new WebSocket('wss://nexus.example.com/coordination/collaborate?token=' + access_token);

session.onopen = () => {
  // Initialize collaboration
  session.send(JSON.stringify({
    session_id: negotiation_id,
    from_agent: 'agent_coordinator',
    message_type: 'init',
    payload: { agents: assigned_agents.map(a => a.agent_id) }
  }));
};

session.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Collaboration message:', message);
};
```

---

## Appendix

### Environment Variables

```bash
# Authentication
NEXUS_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXUS_JWT_SECRET=your-secret-key-here

# Database
NEXUS_DATABASE_URL=postgresql://user:pass@host:5432/nexus

# Redis (for caching/sessions)
NEXUS_REDIS_URL=redis://localhost:6379

# API Configuration
NEXUS_API_PORT=8080
NEXUS_ENVIRONMENT=production
NEXUS_LOG_LEVEL=info

# Rate Limiting
NEXUS_RATE_LIMIT_ENABLED=true
NEXUS_RATE_LIMIT_MAX_REQUESTS=1000

# Security
NEXUS_TLS_CERT_PATH=/path/to/cert.pem
NEXUS_TLS_KEY_PATH=/path/to/key.pem
```

### Versioning

The API uses semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible

Version specified in URL path: `/v1/tasks`, `/v2/tasks`

### Support

- **Documentation**: https://docs.nexus.example.com
- **API Status**: https://status.nexus.example.com
- **Issues**: https://github.com/hannesmitterer/Global-general-intelligence/issues

---

**End of Nexus API Specification v1.0.0**
