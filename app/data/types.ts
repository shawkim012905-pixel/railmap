export type NodeType = 
  | 'user'
  | 'wallet'
  | 'terminal'
  | 'merchant'
  | 'processor'
  | 'network'
  | 'issuer'
  | 'bank'
  | 'settlement'
  | 'gateway'
  | 'acquirer'
  | 'other';

export interface PaymentNode {
  id: string;
  label: string;
  tooltip: string;
  type: NodeType;
}

export interface PaymentEdge {
  from: string;
  to: string;
  label: string;
}

export interface PaymentMetrics {
  authTime: string; // e.g., "2-3 seconds"
  settlementTime: string; // e.g., "1-2 business days"
  consumerFee: string; // e.g., "$0.00" or "Free"
  merchantFee: string; // e.g., "2.9% + $0.30"
}

export interface FeeModel {
  type: 'percent_plus_fixed' | 'flat' | 'free' | 'wire' | 'percent_plus_fixed_with_cap' | 'flat_with_international';
  percent?: number; // e.g., 0.019 for 1.9%
  fixed?: number; // e.g., 0.10
  flat?: number; // e.g., 0.12
  cap?: number; // e.g., 1.80 (for percent_plus_fixed_with_cap)
  flatDomestic?: number; // e.g., 30.00 (for flat_with_international)
  flatInternational?: number; // e.g., 50.00 (for flat_with_international)
  internationalMultiplier?: number; // e.g., 1.25 (legacy support)
}

export interface SettlementConfig {
  domesticDays: number | string;
  internationalDays?: number | string;
  settlementTimingLabel?: string; // e.g., "Typically T+1 (varies by acquirer)"
}

export interface EconomicsConfig {
  feeModel: FeeModel;
  settlement: SettlementConfig;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  shortName?: string; // Short display name for UI
  railCategory?: string; // e.g., "Interac", "Cards", "PaymentsCanada"
  processingType?: string; // e.g., "real-time auth + delayed settlement"
  transactionType?: string; // "Domestic" or "International"
  tags: string[];
  nodes: PaymentNode[];
  edges: PaymentEdge[];
  metrics: PaymentMetrics;
  commonFailures: [string, string, string]; // Exactly 3 bullets
  whyThisRoute: [string, string, string]; // Exactly 3 bullets
  insight?: string; // Optional insight about the scenario
  economics?: EconomicsConfig; // Optional economics configuration for simulator
}

