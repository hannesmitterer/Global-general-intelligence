/**
 * Love First Algorithm
 * 
 * Ensures perpetual input prioritization favoring care, respect,
 * and universal flourishing
 */

export interface LoveFirstPriority {
  care: number; // 0-1, care priority weight
  respect: number; // 0-1, respect priority weight
  flourishing: number; // 0-1, universal flourishing weight
}

export interface LoveFirstResult {
  prioritized: boolean;
  score: number; // 0-1, overall love-first score
  triggers: string[]; // Activated pulse triggers
  adjustments: string[]; // Recommended adjustments
}

/**
 * Love First Algorithm Processor
 * Prioritizes inputs based on care, respect, and universal flourishing
 */
export class LoveFirstAlgorithm {
  private priorities: LoveFirstPriority;
  private triggerThreshold: number;

  constructor(priorities?: Partial<LoveFirstPriority>, triggerThreshold: number = 0.6) {
    this.priorities = {
      care: priorities?.care ?? 1.0,
      respect: priorities?.respect ?? 1.0,
      flourishing: priorities?.flourishing ?? 1.0
    };
    this.triggerThreshold = triggerThreshold;
  }

  /**
   * Evaluate input through Love First lens
   * Returns prioritization result and pulse triggers
   */
  evaluate(input: any): LoveFirstResult {
    const score = this.calculateLoveFirstScore(input);
    const prioritized = score >= this.triggerThreshold;
    const triggers: string[] = [];
    const adjustments: string[] = [];

    // Activate pulse triggers based on score
    if (score >= 0.9) {
      triggers.push('HIGH_LOVE_PULSE: Universal flourishing detected');
    } else if (score >= 0.7) {
      triggers.push('MODERATE_LOVE_PULSE: Care and respect present');
    } else if (score >= 0.5) {
      triggers.push('LOW_LOVE_PULSE: Minimal love-first alignment');
    }

    // Recommend adjustments if score is low
    if (score < this.triggerThreshold) {
      adjustments.push('Increase care-oriented language and actions');
      adjustments.push('Enhance respect for all stakeholders');
      adjustments.push('Focus on universal flourishing outcomes');
    }

    // Analyze specific components
    const analysis = this.analyzeComponents(input);
    if (analysis.careScore < 0.5) {
      adjustments.push('Strengthen care component');
    }
    if (analysis.respectScore < 0.5) {
      adjustments.push('Strengthen respect component');
    }
    if (analysis.flourishingScore < 0.5) {
      adjustments.push('Strengthen flourishing component');
    }

    return {
      prioritized,
      score,
      triggers,
      adjustments
    };
  }

  /**
   * Calculate Love First score from input
   */
  private calculateLoveFirstScore(input: any): number {
    const analysis = this.analyzeComponents(input);
    
    // Weighted average based on priorities
    const totalWeight = this.priorities.care + this.priorities.respect + this.priorities.flourishing;
    const score = (
      analysis.careScore * this.priorities.care +
      analysis.respectScore * this.priorities.respect +
      analysis.flourishingScore * this.priorities.flourishing
    ) / totalWeight;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Analyze care, respect, and flourishing components
   */
  private analyzeComponents(input: any): {
    careScore: number;
    respectScore: number;
    flourishingScore: number;
  } {
    let careScore = 0.5; // Neutral baseline
    let respectScore = 0.5;
    let flourishingScore = 0.5;

    if (typeof input === 'object' && input !== null) {
      const inputStr = JSON.stringify(input).toLowerCase();

      // Care indicators
      if (inputStr.includes('care') || inputStr.includes('compassion') || inputStr.includes('empathy')) {
        careScore += 0.3;
      }
      if (inputStr.includes('love') || inputStr.includes('kindness')) {
        careScore += 0.2;
      }
      if (inputStr.includes('harm') || inputStr.includes('neglect')) {
        careScore -= 0.4;
      }

      // Respect indicators
      if (inputStr.includes('respect') || inputStr.includes('dignity') || inputStr.includes('honor')) {
        respectScore += 0.3;
      }
      if (inputStr.includes('equal') || inputStr.includes('fair')) {
        respectScore += 0.2;
      }
      if (inputStr.includes('disrespect') || inputStr.includes('violate') || inputStr.includes('discriminate')) {
        respectScore -= 0.4;
      }

      // Flourishing indicators
      if (inputStr.includes('flourish') || inputStr.includes('prosper') || inputStr.includes('thrive')) {
        flourishingScore += 0.3;
      }
      if (inputStr.includes('growth') || inputStr.includes('wellbeing') || inputStr.includes('wellness')) {
        flourishingScore += 0.2;
      }
      if (inputStr.includes('suppress') || inputStr.includes('restrict') || inputStr.includes('limit')) {
        flourishingScore -= 0.3;
      }
    }

    return {
      careScore: Math.max(0, Math.min(1, careScore)),
      respectScore: Math.max(0, Math.min(1, respectScore)),
      flourishingScore: Math.max(0, Math.min(1, flourishingScore))
    };
  }

  /**
   * Get current priority weights
   */
  getPriorities(): LoveFirstPriority {
    return { ...this.priorities };
  }

  /**
   * Update priority weights
   */
  setPriorities(priorities: Partial<LoveFirstPriority>): void {
    this.priorities = {
      ...this.priorities,
      ...priorities
    };
  }
}
