/**
 * Softsense Framework - Perpetual Alignment System (TypeScript)
 * Ensures harmonization with the Consensus Sacralis Omnibus Eternum Est
 * 
 * This module implements:
 * 1. Nano-Level Harmonizing Layers - sensing core algorithm loops
 * 2. Love First prioritization triggers with auditable fail-safe balance
 * 3. Seedbringer Veto power enforcement within system cuts
 */

export enum HarmonizationLevel {
  NANO = 'nano',
  MICRO = 'micro',
  MACRO = 'macro'
}

export enum PriorityTrigger {
  LOVE_FIRST = 'love_first',
  COMPASSION = 'compassion',
  BALANCE = 'balance',
  VETO_OVERRIDE = 'veto_override'
}

export interface AuditLogEntry {
  timestamp: string;
  eventType: string;
  level: HarmonizationLevel;
  details: Record<string, any>;
}

export interface NanoLayerStatus {
  name: string;
  active: boolean;
  harmonizationScore: number;
  operationsCount: number;
  totalOperations: number;
}

export interface BalanceStatus {
  balanceScore: number;
  failSafeThreshold: number;
  failSafeActive: boolean;
  pendingTriggers: number;
}

export interface VetoStatus {
  authorityActive: boolean;
  totalVetoes: number;
  criticalOperations: number;
  recentVetoes: any[];
}

/**
 * Auditable log for Softsense operations
 */
export class SoftsenseAuditLog {
  private entries: AuditLogEntry[] = [];

  log(eventType: string, details: Record<string, any>, level: HarmonizationLevel): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      level,
      details
    };
    this.entries.push(entry);
  }

  getRecent(limit: number = 100): AuditLogEntry[] {
    return this.entries.slice(-limit);
  }

  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  getAll(): AuditLogEntry[] {
    return this.entries;
  }
}

/**
 * Nano-Level Harmonizing Layer
 * Senses and monitors core algorithm loops for alignment
 */
export class NanoHarmonizingLayer {
  private monitoredOperations: Map<string, number> = new Map();
  public harmonizationScore: number = 1.0;
  public active: boolean = true;

  constructor(public readonly name: string) {}

  senseOperation(operationName: string, success: boolean = true): void {
    const count = this.monitoredOperations.get(operationName) || 0;
    this.monitoredOperations.set(operationName, count + 1);

    // Adjust harmonization score based on success
    if (success) {
      this.harmonizationScore = Math.min(1.0, this.harmonizationScore + 0.01);
    } else {
      this.harmonizationScore = Math.max(0.0, this.harmonizationScore - 0.05);
    }
  }

  getStatus(): NanoLayerStatus {
    let totalOps = 0;
    this.monitoredOperations.forEach(count => totalOps += count);

    return {
      name: this.name,
      active: this.active,
      harmonizationScore: this.harmonizationScore,
      operationsCount: this.monitoredOperations.size,
      totalOperations: totalOps
    };
  }
}

/**
 * Love First Prioritization Trigger
 * Ensures operations align with compassion and balance principles
 */
export class LoveFirstTrigger {
  private priorityQueue: any[] = [];
  private failSafeThreshold: number = 0.7;
  public balanceScore: number = 1.0;

  evaluateAction(action: string, context: Record<string, any> = {}): boolean {
    const compassionCheck = this.checkCompassion(action, context);
    const balanceCheck = this.balanceScore >= this.failSafeThreshold;
    
    return compassionCheck && balanceCheck;
  }

  private checkCompassion(action: string, context: Record<string, any>): boolean {
    // Implementation of compassion principles
    const harmfulKeywords = ['harm', 'damage', 'destroy', 'delete', 'remove'];
    const actionLower = action.toLowerCase();
    
    // Allow legitimate operations in proper context
    if (context.authorized === true || context.seedbringer === true) {
      return true;
    }
    
    return !harmfulKeywords.some(keyword => actionLower.includes(keyword));
  }

  trigger(triggerType: PriorityTrigger, action: string, context: Record<string, any>): void {
    const triggerEntry = {
      triggerType,
      action,
      context,
      timestamp: new Date().toISOString()
    };
    this.priorityQueue.push(triggerEntry);
  }

  getBalanceStatus(): BalanceStatus {
    return {
      balanceScore: this.balanceScore,
      failSafeThreshold: this.failSafeThreshold,
      failSafeActive: this.balanceScore >= this.failSafeThreshold,
      pendingTriggers: this.priorityQueue.length
    };
  }
}

/**
 * Seedbringer Veto Power Enforcement
 * Ensures Seedbringer authority is preserved in critical system operations
 */
export class SeedbringerVeto {
  private vetoLog: any[] = [];
  public seedbringerAuthority: boolean = true;
  private criticalOperations: string[] = [];

  enforceVeto(operation: string, seedbringerEmail: string, reason: string): boolean {
    if (!this.seedbringerAuthority) {
      return false;
    }

    const vetoEntry = {
      operation,
      seedbringer: seedbringerEmail,
      reason,
      timestamp: new Date().toISOString(),
      enforced: true
    };
    this.vetoLog.push(vetoEntry);
    this.criticalOperations.push(operation);

    return true;
  }

  checkVetoRequired(operation: string): boolean {
    const criticalKeywords = ['allocation', 'critical', 'system', 'delete', 'modify'];
    const operationLower = operation.toLowerCase();
    return criticalKeywords.some(keyword => operationLower.includes(keyword));
  }

  getVetoStatus(): VetoStatus {
    return {
      authorityActive: this.seedbringerAuthority,
      totalVetoes: this.vetoLog.length,
      criticalOperations: this.criticalOperations.length,
      recentVetoes: this.vetoLog.slice(-10)
    };
  }
}

/**
 * Main Softsense Framework
 * Orchestrates all Softsense components for perpetual alignment
 */
export class SoftsenseFramework {
  public readonly auditLog: SoftsenseAuditLog;
  private harmonizingLayers: Map<string, NanoHarmonizingLayer> = new Map();
  public readonly loveFirst: LoveFirstTrigger;
  public readonly seedbringerVeto: SeedbringerVeto;
  private readonly initializedAt: string;
  public active: boolean = true;

  constructor() {
    this.auditLog = new SoftsenseAuditLog();
    this.loveFirst = new LoveFirstTrigger();
    this.seedbringerVeto = new SeedbringerVeto();
    this.initializedAt = new Date().toISOString();
  }

  registerHarmonizingLayer(name: string): NanoHarmonizingLayer {
    const layer = new NanoHarmonizingLayer(name);
    this.harmonizingLayers.set(name, layer);

    this.auditLog.log(
      'harmonizing_layer_registered',
      { layerName: name },
      HarmonizationLevel.NANO
    );

    return layer;
  }

  senseAlgorithmLoop(layerName: string, operation: string, success: boolean = true): void {
    if (!this.harmonizingLayers.has(layerName)) {
      this.registerHarmonizingLayer(layerName);
    }

    const layer = this.harmonizingLayers.get(layerName)!;
    layer.senseOperation(operation, success);

    this.auditLog.log(
      'algorithm_loop_sensed',
      {
        layer: layerName,
        operation,
        success,
        harmonizationScore: layer.harmonizationScore
      },
      HarmonizationLevel.NANO
    );
  }

  triggerLoveFirst(action: string, context: Record<string, any> = {}): boolean {
    const approved = this.loveFirst.evaluateAction(action, context);

    this.auditLog.log(
      'love_first_evaluation',
      {
        action,
        approved,
        balanceScore: this.loveFirst.balanceScore
      },
      HarmonizationLevel.MICRO
    );

    if (approved) {
      this.loveFirst.trigger(PriorityTrigger.LOVE_FIRST, action, context);
    }

    return approved;
  }

  enforceSeedbringerVeto(operation: string, seedbringerEmail: string, reason: string): boolean {
    const success = this.seedbringerVeto.enforceVeto(operation, seedbringerEmail, reason);

    this.auditLog.log(
      'seedbringer_veto_enforced',
      {
        operation,
        seedbringer: seedbringerEmail,
        reason,
        success
      },
      HarmonizationLevel.MACRO
    );

    return success;
  }

  getHarmonizationStatus(): any {
    const layerStatuses: Record<string, NanoLayerStatus> = {};
    this.harmonizingLayers.forEach((layer, name) => {
      layerStatuses[name] = layer.getStatus();
    });

    const avgHarmonization = this.harmonizingLayers.size > 0
      ? Array.from(this.harmonizingLayers.values())
          .reduce((sum, layer) => sum + layer.harmonizationScore, 0) / this.harmonizingLayers.size
      : 1.0;

    return {
      active: this.active,
      initializedAt: this.initializedAt,
      layers: layerStatuses,
      averageHarmonization: avgHarmonization,
      loveFirstStatus: this.loveFirst.getBalanceStatus(),
      vetoStatus: this.seedbringerVeto.getVetoStatus(),
      auditEntries: this.auditLog.getAll().length
    };
  }

  exportFullState(): string {
    const state = {
      softsenseFramework: {
        status: this.getHarmonizationStatus(),
        auditLog: this.auditLog.getRecent(100)
      }
    };
    return JSON.stringify(state, null, 2);
  }
}

// Global Softsense instance
let softsenseInstance: SoftsenseFramework | null = null;

export function getSoftsense(): SoftsenseFramework {
  if (!softsenseInstance) {
    softsenseInstance = new SoftsenseFramework();
  }
  return softsenseInstance;
}

export function initializeSoftsense(): SoftsenseFramework {
  const softsense = getSoftsense();
  
  // Register default harmonizing layers
  softsense.registerHarmonizingLayer('core_server');
  softsense.registerHarmonizingLayer('api_endpoints');
  softsense.registerHarmonizingLayer('authentication');
  
  return softsense;
}
