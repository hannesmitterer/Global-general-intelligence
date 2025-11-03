/**
 * Wallet configuration types for investment and governance operations
 */

export interface WalletConfig {
  /**
   * Primary consolidated EVM wallet address
   */
  address: string;
  
  /**
   * Blockchain network (to be confirmed)
   * Examples: 'polygon', 'arbitrum', 'ethereum'
   */
  chain: string | null;
  
  /**
   * Fundraising asset (to be confirmed)
   * Examples: 'USDC', 'ETH', 'USDT'
   */
  asset: string | null;
  
  /**
   * Decimal places for the asset (to be confirmed)
   */
  decimals: number | null;
}

export interface OfferingConfig {
  /**
   * Start date of the offering
   */
  startDate: string;
  
  /**
   * Fundraising goal in asset units
   */
  goal: number;
  
  /**
   * Current status of the offering
   */
  status: string;
}

export interface ConsolidatedWalletConfig {
  /**
   * Primary wallet for all investment operations
   */
  primary: WalletConfig;
  
  /**
   * Governance audit wallet (redirected to primary)
   */
  governanceAudit: {
    redirectTo: 'primary';
    note: string;
  };
  
  /**
   * Digital bonds wallet (consolidated into primary)
   */
  digitalBonds: {
    consolidatedInto: 'primary';
    note: string;
  };
  
  /**
   * Offering parameters
   */
  offering: OfferingConfig;
}
