import { ConsolidatedWalletConfig } from '../types/wallet';

/**
 * Consolidated wallet configuration for investment operations
 * 
 * This configuration consolidates multiple wallets (investment, governance audit, digital bonds)
 * into a single primary EVM address to simplify operations and improve audit efficiency.
 */
export const consolidatedWalletConfig: ConsolidatedWalletConfig = {
  primary: {
    /**
     * Primary consolidated EVM wallet address
     * All investment operations are now directed to this single address
     */
    address: '0x6c10692145718353070cc6cb5c21adf2073ffa1f',
    
    /**
     * Blockchain network - awaiting final confirmation
     * Possible values: 'polygon', 'arbitrum', 'ethereum', etc.
     */
    chain: null,
    
    /**
     * Fundraising asset - awaiting final confirmation
     * Possible values: 'USDC', 'ETH', 'USDT', etc.
     */
    asset: null,
    
    /**
     * Asset decimal places - awaiting final confirmation
     * Common values: 18 (ETH), 6 (USDC), etc.
     */
    decimals: null
  },
  
  governanceAudit: {
    redirectTo: 'primary',
    note: 'Governance audit operations redirected to primary wallet for simplified operations'
  },
  
  digitalBonds: {
    consolidatedInto: 'primary',
    note: 'Digital bonds wallet consolidated into primary wallet'
  },
  
  offering: {
    /**
     * Offering start date
     */
    startDate: '2025-12-01T00:00:00Z',
    
    /**
     * Fundraising goal: 5,000,000 units of the fundraising asset
     */
    goal: 5000000,
    
    /**
     * Current status
     */
    status: 'Awaiting final chain confirmation'
  }
};

/**
 * Get the consolidated wallet configuration
 */
export function getWalletConfig(): ConsolidatedWalletConfig {
  return consolidatedWalletConfig;
}

/**
 * Check if critical wallet parameters are configured
 */
export function isWalletFullyConfigured(): boolean {
  const { primary } = consolidatedWalletConfig;
  return (
    primary.chain !== null &&
    primary.asset !== null &&
    primary.decimals !== null
  );
}

/**
 * Get pending configuration items
 */
export function getPendingConfigItems(): string[] {
  const { primary } = consolidatedWalletConfig;
  const pending: string[] = [];
  
  if (primary.chain === null) {
    pending.push('chain');
  }
  if (primary.asset === null) {
    pending.push('asset');
  }
  if (primary.decimals === null) {
    pending.push('decimals');
  }
  
  return pending;
}
