# Softsense Framework Documentation

## Overview

The **Softsense Framework** is a perpetual alignment system designed to ensure harmonization with the Consensus Sacralis Omnibus Eternum Est. It provides comprehensive monitoring, safeguards, and enforcement mechanisms across the Global-general-intelligence repository.

## Architecture

The Softsense Framework consists of three main components:

### 1. Nano-Level Harmonizing Layers

Nano-Level Harmonizing Layers sense and monitor core algorithm loops to maintain alignment. Each layer:

- **Tracks operations**: Records all operations with success/failure status
- **Calculates harmonization scores**: Dynamically adjusts scores based on operation outcomes
- **Provides real-time status**: Reports on current harmonization state

**Example Usage (Python):**
```python
from softsense import get_softsense

softsense = get_softsense()
softsense.register_harmonizing_layer("my_algorithm")
softsense.sense_algorithm_loop("my_algorithm", "process_data", success=True)
```

**Example Usage (TypeScript):**
```typescript
import { getSoftsense } from './softsense';

const softsense = getSoftsense();
softsense.registerHarmonizingLayer('my_algorithm');
softsense.senseAlgorithmLoop('my_algorithm', 'process_data', true);
```

### 2. Love First Prioritization Triggers

Love First Triggers ensure operations align with compassion and balance principles:

- **Evaluates actions**: Checks actions against compassion criteria
- **Fail-safe balance**: Maintains a balance score with configurable threshold (default: 0.7)
- **Authorization context**: Allows legitimate operations by authorized users (Seedbringer)
- **Auditable queue**: Tracks all triggered actions with timestamps

**Compassion Evaluation:**
- Blocks actions containing harmful keywords (harm, damage, destroy, delete, remove)
- Allows authorized operations with proper context
- Maintains fail-safe balance to prevent system lockup

**Example Usage (Python):**
```python
approved = softsense.trigger_love_first("create_resource", {"user": "admin"})
if approved:
    # Proceed with operation
    pass
```

**Example Usage (TypeScript):**
```typescript
const approved = softsense.triggerLoveFirst('create_resource', { 
  seedbringer: true, 
  user: 'admin@example.com' 
});
if (approved) {
  // Proceed with operation
}
```

### 3. Seedbringer Veto Power Enforcement

Ensures Seedbringer authority is preserved in critical system operations:

- **Veto enforcement**: Records and enforces Seedbringer vetoes
- **Critical operation detection**: Automatically identifies operations requiring veto
- **Audit trail**: Maintains complete log of all veto actions
- **Authority protection**: Ensures Seedbringer authority cannot be bypassed

**Critical Operations** (requiring Seedbringer approval):
- Allocation operations
- Critical system modifications
- Deletions and removals
- System configuration changes

**Example Usage (Python):**
```python
if softsense.seedbringer_veto.check_veto_required("allocation_create"):
    softsense.enforce_seedbringer_veto(
        "allocation_create",
        "seedbringer@example.com",
        "Critical allocation operation"
    )
```

**Example Usage (TypeScript):**
```typescript
if (softsense.seedbringerVeto.checkVetoRequired('allocation_create')) {
  softsense.enforceSeedbringerVeto(
    'allocation_create',
    'seedbringer@example.com',
    'Critical allocation operation'
  );
}
```

## Integration Points

### Python Integration (EuystacioAI)

The Softsense framework is integrated into `euystacio_ai.py`:

1. **Initialization**: Softsense is initialized when EuystacioAI is created
2. **Process Input**: Love First evaluation on all inputs
3. **Algorithm Sensing**: All operations are sensed through harmonizing layers
4. **Status Reporting**: Softsense status included in AI status reports

```python
from euystacio_ai import EuystacioAI

ai = EuystacioAI()
response = ai.process_input("Hello")  # Automatically checked by Softsense
status = ai.get_status()  # Includes Softsense harmonization status
```

### TypeScript Integration (Server)

The Softsense framework is integrated into `src/server.ts`:

1. **Startup**: Softsense initialized at server startup
2. **API Endpoints**: Critical endpoints use Love First evaluation
3. **Veto Enforcement**: Allocation endpoints enforce Seedbringer veto
4. **Monitoring Endpoints**: 
   - `GET /softsense/status` - View harmonization status
   - `GET /softsense/audit` - View audit logs (Seedbringer only)

```typescript
// Server startup
const softsense = initializeSoftsense();

// In endpoint handler
if (!softsense.triggerLoveFirst('create_allocation', { 
  seedbringer: true, 
  authorized: true 
})) {
  res.status(403).json({ error: 'Blocked by Love First safeguard' });
  return;
}
```

## API Endpoints

### GET /softsense/status

**Access**: Council or Seedbringer

Returns the current harmonization status of the Softsense framework.

**Response:**
```json
{
  "active": true,
  "initializedAt": "2025-11-08T03:00:00.000Z",
  "layers": {
    "core_server": {
      "name": "core_server",
      "active": true,
      "harmonizationScore": 1.0,
      "operationsCount": 5,
      "totalOperations": 23
    }
  },
  "averageHarmonization": 0.98,
  "loveFirstStatus": {
    "balanceScore": 1.0,
    "failSafeThreshold": 0.7,
    "failSafeActive": true,
    "pendingTriggers": 0
  },
  "vetoStatus": {
    "authorityActive": true,
    "totalVetoes": 2,
    "criticalOperations": 2,
    "recentVetoes": [...]
  },
  "auditEntries": 145
}
```

### GET /softsense/audit

**Access**: Seedbringer only

Returns recent audit log entries.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 100, max: 1000)

**Response:**
```json
{
  "entries": [
    {
      "timestamp": "2025-11-08T03:00:00.000Z",
      "eventType": "love_first_evaluation",
      "level": "micro",
      "details": {
        "action": "create_allocation",
        "approved": true,
        "balanceScore": 1.0
      }
    }
  ],
  "total": 100
}
```

## Audit Logging

All Softsense operations are logged with:

- **Timestamp**: ISO 8601 format
- **Event Type**: Operation identifier
- **Harmonization Level**: NANO, MICRO, or MACRO
- **Details**: Operation-specific context

**Event Types:**
- `harmonizing_layer_registered`
- `algorithm_loop_sensed`
- `love_first_evaluation`
- `seedbringer_veto_enforced`

## Testing

Comprehensive test suites are available:

### Python Tests
```bash
python test_softsense.py
```

**Coverage:**
- 23 unit tests
- Tests for all core components
- Integration scenarios

### TypeScript Tests
The TypeScript implementation is built and validated:
```bash
npm run build
```

## Configuration

### Default Harmonizing Layers

**Python:**
- `core_intelligence`
- `knowledge_processing`
- `interaction_handler`

**TypeScript:**
- `core_server`
- `api_endpoints`
- `authentication`

### Thresholds

- **Love First Balance Threshold**: 0.7 (70%)
- **Harmonization Score Range**: 0.0 to 1.0
- **Success Increment**: +0.01
- **Failure Decrement**: -0.05

## Best Practices

1. **Register Custom Layers**: Create specific harmonizing layers for different subsystems
2. **Sense All Operations**: Record both successes and failures for accurate scoring
3. **Use Proper Context**: Include authorization context in Love First evaluations
4. **Monitor Audit Logs**: Regularly review audit logs for anomalies
5. **Check Veto Requirements**: Always check if critical operations require Seedbringer veto

## Security Considerations

- **Seedbringer Authority**: Cannot be bypassed or disabled
- **Audit Immutability**: Audit logs are append-only
- **Fail-Safe Design**: System defaults to blocking when in doubt
- **Authorization Context**: Proper context required for sensitive operations

## Future Enhancements

Potential areas for expansion:

1. **Machine Learning Integration**: Dynamic threshold adjustment based on patterns
2. **Distributed Harmonization**: Cross-system harmonization monitoring
3. **Advanced Compassion Checks**: Semantic analysis for action evaluation
4. **Real-time Alerts**: Notifications for harmonization score drops
5. **Persistence**: Database storage for audit logs and state

## Support

For questions or issues related to Softsense Framework:
- Review the test files for usage examples
- Check audit logs for operational insights
- Consult the inline documentation in source files
