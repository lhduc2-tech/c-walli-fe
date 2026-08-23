// Types for Fraud Alerts management

export interface TriggeredRule {
  code: string
  name: string
  penalty: number
  desc: string
}

export interface FraudAlertSummary {
  id: string
  correlationId: string
  referenceCode: string
  userId?: string
  userEmail?: string
  userFullName?: string
  transactionType: string
  amount: number
  bankCode?: string
  accountNumber?: string
  recipientFullName?: string
  finalRiskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  systemAction: string
  ruleScore: number
  aiScore: number
  status: 'NEW' | 'REVIEW' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  updatedAt: string
}

export interface FraudAlertDetail extends FraudAlertSummary {
  recipientPhoneNumber?: string
  lgbmProbPct: number
  aeReconstructionError: number
  aeThreshold: number
  /** Raw JSON string — parse khi hiển thị */
  triggeredRules: string | TriggeredRule[]
  /** Raw JSON string — parse khi hiển thị */
  threatWarnings: string | string[]
  /** Raw JSON string snapshot của payload giao dịch gốc */
  payloadSnapshot?: string
}

export interface FraudAlertSearchRequest {
  pageIndex?: number
  pageSize?: number
  sort?: string
  direction?: 'ASC' | 'DESC'
  search?: string
  riskLevel?: string
  status?: string
  fromCreatedAt?: string
  toCreatedAt?: string
}

export interface UpdateFraudAlertStatusRequest {
  status: 'REVIEW' | 'RESOLVED' | 'DISMISSED'
  note?: string
}
