/**
 * Seed-003 KPI tracker for Hope-Sorrow metrics
 * Maintains a rolling window of samples to compute hope-ratio
 */

interface Sample {
  sorrow: number;
  hope: number;
  timestamp: number;
}

class Seed003KPI {
  private samples: Sample[] = [];
  private readonly maxSamples: number = 1000; // Keep last 1000 samples

  /**
   * Push a new sample (sorrow, hope) into the KPI tracker
   */
  pushSample(sorrow: number, hope: number): void {
    const sample: Sample = {
      sorrow,
      hope,
      timestamp: Date.now()
    };

    this.samples.push(sample);

    // Keep only the most recent maxSamples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Compute the hope-ratio from current samples
   * Hope-ratio = sum(hope) / (sum(hope) + sum(sorrow))
   */
  getHopeRatio(): number {
    if (this.samples.length === 0) {
      return 0;
    }

    const totalHope = this.samples.reduce((sum, s) => sum + s.hope, 0);
    const totalSorrow = this.samples.reduce((sum, s) => sum + s.sorrow, 0);
    const total = totalHope + totalSorrow;

    if (total === 0) {
      return 0;
    }

    return totalHope / total;
  }

  /**
   * Get statistics about current KPI state
   */
  getStats(): {
    sampleCount: number;
    hopeRatio: number;
    avgHope: number;
    avgSorrow: number;
  } {
    const count = this.samples.length;
    
    if (count === 0) {
      return {
        sampleCount: 0,
        hopeRatio: 0,
        avgHope: 0,
        avgSorrow: 0
      };
    }

    const totalHope = this.samples.reduce((sum, s) => sum + s.hope, 0);
    const totalSorrow = this.samples.reduce((sum, s) => sum + s.sorrow, 0);

    return {
      sampleCount: count,
      hopeRatio: this.getHopeRatio(),
      avgHope: totalHope / count,
      avgSorrow: totalSorrow / count
    };
  }
}

// Singleton instance
export const seed003KPI = new Seed003KPI();
