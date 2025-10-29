/**
 * Canonical shape for Sentimento Live Event payloads
 */
export interface SentimentoLiveEvent {
  /**
   * Composite metrics containing hope and sorrow values
   */
  composites: {
    hope: number;
    sorrow: number;
  };
  /**
   * ISO 8601 timestamp of the event
   */
  timestamp: string;
  /**
   * Optional metadata for the event
   */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for Sentimento WebSocket broadcasting
 */
export interface SentimentoConfig {
  /**
   * Maximum broadcast frequency in Hz
   */
  broadcastHz: number;
  /**
   * Maximum buffer size in KB before applying backpressure
   */
  bufferMaxKb: number;
}
