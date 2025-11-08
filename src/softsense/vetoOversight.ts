/**
 * Seedbringer Veto Oversight System
 * 
 * Expands technical infrastructure to safeguard the enshrined perpetual veto
 * assigned to the Seedbringer role with trusted node veto-safe actions
 */

export interface VetoAction {
  actionId: string;
  actionType: string;
  timestamp: string;
  initiator: string;
  vetoed: boolean;
  reason?: string;
}

export interface VetoOversightResult {
  allowed: boolean;
  vetoApplied: boolean;
  vetoReason?: string;
  trustedNode: boolean;
  safeguards: string[];
}

export type VetoValidator = (action: any) => { veto: boolean; reason?: string };

/**
 * Seedbringer Veto Oversight Processor
 * Implements veto-safe actions and oversight mechanisms
 */
export class SeedbringerVetoOversight {
  private vetoHistory: VetoAction[];
  private vetoValidators: Map<string, VetoValidator>;
  private trustedNodes: Set<string>;

  constructor() {
    this.vetoHistory = [];
    this.vetoValidators = new Map();
    this.trustedNodes = new Set();

    // Initialize default veto validators
    this.initializeDefaultValidators();
  }

  /**
   * Initialize default veto validators
   */
  private initializeDefaultValidators(): void {
    // Validator for dignity violations
    this.addVetoValidator('dignity_check', (action) => {
      const actionStr = JSON.stringify(action).toLowerCase();
      if (actionStr.includes('harm') || actionStr.includes('violate') || actionStr.includes('discriminate')) {
        return { veto: true, reason: 'Action violates dignity principles' };
      }
      return { veto: false };
    });

    // Validator for unauthorized allocations
    this.addVetoValidator('allocation_check', (action) => {
      if (action.type === 'allocation' && !action.seedbringerApproved) {
        return { veto: true, reason: 'Allocation requires Seedbringer approval' };
      }
      return { veto: false };
    });

    // Validator for respect violations
    this.addVetoValidator('respect_check', (action) => {
      const actionStr = JSON.stringify(action).toLowerCase();
      if (actionStr.includes('disrespect') || actionStr.includes('insult')) {
        return { veto: true, reason: 'Action violates respect principles' };
      }
      return { veto: false };
    });
  }

  /**
   * Process action through veto oversight
   */
  processAction(action: any, initiator: string): VetoOversightResult {
    const actionId = this.generateActionId();
    const timestamp = new Date().toISOString();
    const isTrustedNode = this.trustedNodes.has(initiator);
    const safeguards: string[] = [];

    // Run through all veto validators
    let vetoApplied = false;
    let vetoReason: string | undefined;

    for (const [validatorName, validator] of this.vetoValidators) {
      const result = validator(action);
      if (result.veto) {
        vetoApplied = true;
        vetoReason = result.reason || `Vetoed by ${validatorName}`;
        safeguards.push(`Veto validator ${validatorName} triggered`);
        break;
      }
    }

    // Record veto action
    const vetoAction: VetoAction = {
      actionId,
      actionType: action.type || 'unknown',
      timestamp,
      initiator,
      vetoed: vetoApplied,
      reason: vetoReason
    };
    this.vetoHistory.push(vetoAction);

    // Add safeguard notices
    if (isTrustedNode) {
      safeguards.push('Action from trusted node');
    }
    if (!vetoApplied) {
      safeguards.push('All veto validators passed');
    }

    return {
      allowed: !vetoApplied,
      vetoApplied,
      vetoReason,
      trustedNode: isTrustedNode,
      safeguards
    };
  }

  /**
   * Add a custom veto validator
   */
  addVetoValidator(name: string, validator: VetoValidator): void {
    this.vetoValidators.set(name, validator);
  }

  /**
   * Remove a veto validator
   */
  removeVetoValidator(name: string): void {
    this.vetoValidators.delete(name);
  }

  /**
   * Add a trusted node
   */
  addTrustedNode(nodeId: string): void {
    this.trustedNodes.add(nodeId);
  }

  /**
   * Remove a trusted node
   */
  removeTrustedNode(nodeId: string): void {
    this.trustedNodes.delete(nodeId);
  }

  /**
   * Get veto history
   */
  getVetoHistory(limit?: number): VetoAction[] {
    const history = [...this.vetoHistory];
    if (limit) {
      return history.slice(-limit);
    }
    return history;
  }

  /**
   * Get veto statistics
   */
  getVetoStats(): {
    totalActions: number;
    vetoedActions: number;
    allowedActions: number;
    vetoRate: number;
  } {
    const totalActions = this.vetoHistory.length;
    const vetoedActions = this.vetoHistory.filter(a => a.vetoed).length;
    const allowedActions = totalActions - vetoedActions;
    const vetoRate = totalActions > 0 ? vetoedActions / totalActions : 0;

    return {
      totalActions,
      vetoedActions,
      allowedActions,
      vetoRate
    };
  }

  /**
   * Generate unique action ID
   */
  private generateActionId(): string {
    return `veto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear veto history (for testing/maintenance)
   */
  clearHistory(): void {
    this.vetoHistory = [];
  }
}
