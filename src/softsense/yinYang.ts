/**
 * Yin-Yang Balance Synchronization
 * 
 * Implements harmonious conflict-resolution balancing logic within processes
 * with fail-safe alternate gates
 */

export interface YinYangState {
  yin: number; // 0-1, yin energy (receptive, nurturing)
  yang: number; // 0-1, yang energy (active, assertive)
  balance: number; // 0-1, balance measure
}

export interface ConflictResolution {
  resolved: boolean;
  method: string;
  balancedState: YinYangState;
  failsafeActivated: boolean;
  recommendations: string[];
}

/**
 * Yin-Yang Balance Processor
 * Synchronizes opposing forces and resolves conflicts harmoniously
 */
export class YinYangBalance {
  private state: YinYangState;
  private balanceThreshold: number;
  private failsafeEnabled: boolean;

  constructor(balanceThreshold: number = 0.3, failsafeEnabled: boolean = true) {
    this.state = {
      yin: 0.5,
      yang: 0.5,
      balance: 1.0
    };
    this.balanceThreshold = balanceThreshold;
    this.failsafeEnabled = failsafeEnabled;
  }

  /**
   * Process input and synchronize Yin-Yang balance
   */
  synchronize(input: any): ConflictResolution {
    // Analyze input for Yin-Yang characteristics
    const yinScore = this.calculateYinScore(input);
    const yangScore = this.calculateYangScore(input);

    // Update state
    this.state.yin = yinScore;
    this.state.yang = yangScore;
    this.state.balance = this.calculateBalance(yinScore, yangScore);

    const recommendations: string[] = [];
    let method = 'HARMONIC_SYNC';
    let failsafeActivated = false;

    // Check if balance is maintained
    const isBalanced = this.state.balance >= this.balanceThreshold;

    if (!isBalanced) {
      if (this.failsafeEnabled) {
        // Activate fail-safe alternate gate
        failsafeActivated = true;
        method = 'FAILSAFE_GATE';
        this.activateFailsafe();
        recommendations.push('Fail-safe gate activated for emergency balancing');
      } else {
        method = 'MANUAL_INTERVENTION_REQUIRED';
        recommendations.push('Manual intervention recommended for balance restoration');
      }
    }

    // Provide balancing recommendations
    if (this.state.yin < 0.4 && this.state.yang > 0.6) {
      recommendations.push('Increase Yin (receptive, nurturing) elements');
      recommendations.push('Balance assertive actions with contemplative approaches');
    } else if (this.state.yang < 0.4 && this.state.yin > 0.6) {
      recommendations.push('Increase Yang (active, assertive) elements');
      recommendations.push('Balance nurturing with decisive action');
    }

    return {
      resolved: isBalanced || failsafeActivated,
      method,
      balancedState: { ...this.state },
      failsafeActivated,
      recommendations
    };
  }

  /**
   * Calculate Yin score (receptive, nurturing characteristics)
   */
  private calculateYinScore(input: any): number {
    let score = 0.5; // Neutral baseline

    if (typeof input === 'object' && input !== null) {
      const inputStr = JSON.stringify(input).toLowerCase();

      // Yin indicators (receptive, nurturing, calm, passive)
      if (inputStr.includes('listen') || inputStr.includes('receive') || inputStr.includes('accept')) {
        score += 0.2;
      }
      if (inputStr.includes('nurture') || inputStr.includes('care') || inputStr.includes('support')) {
        score += 0.2;
      }
      if (inputStr.includes('calm') || inputStr.includes('peace') || inputStr.includes('gentle')) {
        score += 0.15;
      }

      // Anti-Yin indicators
      if (inputStr.includes('force') || inputStr.includes('demand') || inputStr.includes('dominate')) {
        score -= 0.3;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate Yang score (active, assertive characteristics)
   */
  private calculateYangScore(input: any): number {
    let score = 0.5; // Neutral baseline

    if (typeof input === 'object' && input !== null) {
      const inputStr = JSON.stringify(input).toLowerCase();

      // Yang indicators (active, assertive, dynamic, decisive)
      if (inputStr.includes('act') || inputStr.includes('do') || inputStr.includes('execute')) {
        score += 0.2;
      }
      if (inputStr.includes('lead') || inputStr.includes('direct') || inputStr.includes('decide')) {
        score += 0.2;
      }
      if (inputStr.includes('create') || inputStr.includes('build') || inputStr.includes('initiate')) {
        score += 0.15;
      }

      // Anti-Yang indicators
      if (inputStr.includes('passive') || inputStr.includes('wait') || inputStr.includes('defer')) {
        score -= 0.3;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate balance between Yin and Yang
   * Returns 1.0 for perfect balance, lower for imbalance
   */
  private calculateBalance(yin: number, yang: number): number {
    // Perfect balance is when yin and yang are equal
    // Balance decreases as the difference increases
    const difference = Math.abs(yin - yang);
    const balance = 1.0 - difference;
    return Math.max(0, Math.min(1, balance));
  }

  /**
   * Activate fail-safe alternate gate
   * Rebalances to neutral state
   */
  private activateFailsafe(): void {
    console.log('Yin-Yang Fail-Safe Gate: Activating emergency balance restoration');
    
    // Reset to balanced neutral state
    const avg = (this.state.yin + this.state.yang) / 2;
    this.state.yin = avg;
    this.state.yang = avg;
    this.state.balance = 1.0;

    console.log(`  - Yin balanced to: ${this.state.yin.toFixed(3)}`);
    console.log(`  - Yang balanced to: ${this.state.yang.toFixed(3)}`);
  }

  /**
   * Get current Yin-Yang state
   */
  getState(): YinYangState {
    return { ...this.state };
  }

  /**
   * Reset to neutral balanced state
   */
  reset(): void {
    this.state = {
      yin: 0.5,
      yang: 0.5,
      balance: 1.0
    };
  }

  /**
   * Check if currently balanced
   */
  isBalanced(): boolean {
    return this.state.balance >= this.balanceThreshold;
  }
}
