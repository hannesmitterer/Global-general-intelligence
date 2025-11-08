/**
 * Softsense Unified Interface
 * 
 * Orchestrates all Softsense algorithms:
 * - Core harmonics sensing
 * - Love First prioritization
 * - Yin-Yang balance synchronization
 * - Seedbringer veto oversight
 */

import { SoftsenseCore, SoftsenseConfig, SoftsenseResult } from './core';
import { LoveFirstAlgorithm, LoveFirstPriority, LoveFirstResult } from './loveFirst';
import { YinYangBalance, ConflictResolution } from './yinYang';
import { SeedbringerVetoOversight, VetoOversightResult } from './vetoOversight';

export interface SoftsenseProcessResult {
  core: SoftsenseResult;
  loveFirst: LoveFirstResult;
  yinYang: ConflictResolution;
  veto?: VetoOversightResult;
  overallPassed: boolean;
  debugStream: string[];
}

export interface SoftsenseOrchestratorConfig {
  softsenseConfig?: Partial<SoftsenseConfig>;
  loveFirstPriorities?: Partial<LoveFirstPriority>;
  yinYangBalanceThreshold?: number;
  enableVetoOversight?: boolean;
}

/**
 * Softsense Orchestrator
 * Unified interface for all Softsense algorithms
 */
export class SoftsenseOrchestrator {
  private core: SoftsenseCore;
  private loveFirst: LoveFirstAlgorithm;
  private yinYang: YinYangBalance;
  private veto: SeedbringerVetoOversight;
  private vetoEnabled: boolean;

  constructor(config?: SoftsenseOrchestratorConfig) {
    this.core = new SoftsenseCore(config?.softsenseConfig);
    this.loveFirst = new LoveFirstAlgorithm(config?.loveFirstPriorities);
    this.yinYang = new YinYangBalance(config?.yinYangBalanceThreshold);
    this.veto = new SeedbringerVetoOversight();
    this.vetoEnabled = config?.enableVetoOversight ?? true;
  }

  /**
   * Process input through all Softsense algorithms
   * Returns comprehensive results and debug stream
   */
  process(input: any, initiator?: string): SoftsenseProcessResult {
    const debugStream: string[] = [];
    debugStream.push('=== Softsense Processing Pipeline ===');
    debugStream.push(`Timestamp: ${new Date().toISOString()}`);
    debugStream.push(`Initiator: ${initiator || 'anonymous'}`);

    // 1. Core Softsense harmonics sensing
    debugStream.push('\n--- Core Harmonics Sensing ---');
    const coreResult = this.core.sense(input);
    debugStream.push(`Dignity: ${coreResult.harmonics.dignity.toFixed(3)}`);
    debugStream.push(`Prosperity: ${coreResult.harmonics.prosperity.toFixed(3)}`);
    debugStream.push(`Respect: ${coreResult.harmonics.respect.toFixed(3)}`);
    debugStream.push(`Balance: ${coreResult.harmonics.balance.toFixed(3)}`);
    debugStream.push(`Balanced: ${coreResult.balanced}`);
    if (coreResult.warnings.length > 0) {
      debugStream.push(`Warnings: ${coreResult.warnings.join(', ')}`);
    }

    // 2. Love First Algorithm
    debugStream.push('\n--- Love First Algorithm ---');
    const loveFirstResult = this.loveFirst.evaluate(input);
    debugStream.push(`Score: ${loveFirstResult.score.toFixed(3)}`);
    debugStream.push(`Prioritized: ${loveFirstResult.prioritized}`);
    if (loveFirstResult.triggers.length > 0) {
      debugStream.push(`Triggers: ${loveFirstResult.triggers.join(', ')}`);
    }

    // 3. Yin-Yang Balance Synchronization
    debugStream.push('\n--- Yin-Yang Balance ---');
    const yinYangResult = this.yinYang.synchronize(input);
    debugStream.push(`Yin: ${yinYangResult.balancedState.yin.toFixed(3)}`);
    debugStream.push(`Yang: ${yinYangResult.balancedState.yang.toFixed(3)}`);
    debugStream.push(`Balance: ${yinYangResult.balancedState.balance.toFixed(3)}`);
    debugStream.push(`Resolved: ${yinYangResult.resolved}`);
    debugStream.push(`Method: ${yinYangResult.method}`);
    if (yinYangResult.failsafeActivated) {
      debugStream.push('FAILSAFE ACTIVATED');
    }

    // 4. Seedbringer Veto Oversight (if enabled and initiator provided)
    let vetoResult: VetoOversightResult | undefined;
    if (this.vetoEnabled && initiator) {
      debugStream.push('\n--- Veto Oversight ---');
      vetoResult = this.veto.processAction(input, initiator);
      debugStream.push(`Allowed: ${vetoResult.allowed}`);
      debugStream.push(`Veto Applied: ${vetoResult.vetoApplied}`);
      debugStream.push(`Trusted Node: ${vetoResult.trustedNode}`);
      if (vetoResult.vetoReason) {
        debugStream.push(`Veto Reason: ${vetoResult.vetoReason}`);
      }
    }

    // Determine overall pass/fail
    const overallPassed = 
      coreResult.balanced &&
      loveFirstResult.prioritized &&
      yinYangResult.resolved &&
      (!vetoResult || vetoResult.allowed);

    debugStream.push('\n--- Overall Result ---');
    debugStream.push(`Passed: ${overallPassed}`);

    return {
      core: coreResult,
      loveFirst: loveFirstResult,
      yinYang: yinYangResult,
      veto: vetoResult,
      overallPassed,
      debugStream
    };
  }

  /**
   * Get the Core harmonics processor
   */
  getCore(): SoftsenseCore {
    return this.core;
  }

  /**
   * Get the Love First algorithm
   */
  getLoveFirst(): LoveFirstAlgorithm {
    return this.loveFirst;
  }

  /**
   * Get the Yin-Yang balance processor
   */
  getYinYang(): YinYangBalance {
    return this.yinYang;
  }

  /**
   * Get the Veto oversight system
   */
  getVetoOversight(): SeedbringerVetoOversight {
    return this.veto;
  }

  /**
   * Enable or disable veto oversight
   */
  setVetoEnabled(enabled: boolean): void {
    this.vetoEnabled = enabled;
  }

  /**
   * Reset all Softsense components to baseline
   */
  reset(): void {
    this.core.reset();
    this.yinYang.reset();
    this.veto.clearHistory();
  }
}

// Export all components
export { SoftsenseCore, SoftsenseConfig, SoftsenseResult } from './core';
export { LoveFirstAlgorithm, LoveFirstPriority, LoveFirstResult } from './loveFirst';
export { YinYangBalance, ConflictResolution, YinYangState } from './yinYang';
export { SeedbringerVetoOversight, VetoOversightResult, VetoAction } from './vetoOversight';
