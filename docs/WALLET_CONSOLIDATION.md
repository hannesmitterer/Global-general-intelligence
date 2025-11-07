# Wallet Consolidation - Investment Operations

## Overview

This document describes the consolidation of multiple investment wallets into a single primary EVM address to simplify operations and improve audit efficiency.

## Consolidated Wallet Structure

### Primary Wallet (Consolidated)

- **EVM Address**: `0x6c10692145718353070cc6cb5c21adf2073ffa1f`
- **Purpose**: All investment operations (governance audit, digital bonds, etc.)
- **Status**: Active

### Critical Parameters (Pending Confirmation)

The following parameters need to be confirmed before full deployment:

1. **Chain/Network**: Not yet configured
   - Examples: Polygon, Arbitrum, Ethereum Mainnet
   - Required for on-chain automation

2. **Fundraising Asset**: Not yet configured
   - Examples: USDC, ETH, USDT
   - This is the asset that will be collected during fundraising

3. **Asset Decimals**: Not yet configured
   - Examples: 18 (ETH), 6 (USDC), 8 (WBTC)
   - Required for accurate transaction handling

## Wallet Redirections

### Governance Audit Wallet

- **Status**: Redirected to Primary Wallet
- **Purpose**: Simplify governance audit operations
- **Note**: All governance audit operations now use the primary wallet address

### Digital Bonds Wallet

- **Status**: Consolidated into Primary Wallet
- **Purpose**: Centralize bond operations
- **Note**: Digital bond operations now use the primary wallet address

## Offering Parameters

### Start Date
- **Date**: December 1, 2025 at 00:00:00 UTC
- **ISO Format**: `2025-12-01T00:00:00Z`

### Fundraising Goal
- **Amount**: 5,000,000 units
- **Note**: Units are in the fundraising asset (to be confirmed)

### Current Status
- **Status**: "Awaiting final chain confirmation"

## API Access

### Endpoint: GET /wallet/config

Retrieve the consolidated wallet configuration.

**Authentication**: Required (Council or Seedbringer role)

**Response Structure**:
```json
{
  "primary": {
    "address": "0x6c10692145718353070cc6cb5c21adf2073ffa1f",
    "chain": null,
    "asset": null,
    "decimals": null
  },
  "governanceAudit": {
    "redirectTo": "primary",
    "note": "Governance audit operations redirected to primary wallet for simplified operations"
  },
  "digitalBonds": {
    "consolidatedInto": "primary",
    "note": "Digital bonds wallet consolidated into primary wallet"
  },
  "offering": {
    "startDate": "2025-12-01T00:00:00Z",
    "goal": 5000000,
    "status": "Awaiting final chain confirmation"
  },
  "_metadata": {
    "isFullyConfigured": false,
    "pendingConfigItems": ["chain", "asset", "decimals"],
    "user": "user@example.com",
    "role": "seedbringer"
  }
}
```

## Post-Merge Actions Required

1. **Confirm Critical Parameters**:
   - Decide on the blockchain network (Chain)
   - Specify the fundraising asset
   - Set the appropriate decimal value for the chosen asset

2. **Update Configuration**:
   - Edit `src/config/wallet.ts`
   - Set `chain`, `asset`, and `decimals` values
   - Rebuild the application

3. **Configure On-Chain Automation**:
   - Set up smart contracts or scripts for the consolidated wallet
   - Test transactions on testnet first
   - Deploy automation to mainnet

4. **Verify Operations**:
   - Test governance audit operations
   - Test digital bond operations
   - Verify all operations use the primary wallet address

## Configuration File Location

The wallet configuration is defined in:
- **Type Definitions**: `src/types/wallet.ts`
- **Configuration**: `src/config/wallet.ts`

## Security Considerations

- The primary wallet address is public information
- Private keys should NEVER be stored in this repository
- All on-chain operations should be properly secured
- Access to wallet management functions is restricted to authorized roles

## Maintenance

When updating wallet parameters:

1. Edit `src/config/wallet.ts`
2. Update the relevant fields (chain, asset, decimals)
3. Run `npm run build` to compile
4. Restart the server
5. Verify configuration via `/wallet/config` endpoint
