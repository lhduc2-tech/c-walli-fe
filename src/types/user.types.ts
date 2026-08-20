import type { BaseRequest } from './api.types'

export interface AdminSearchUserRequest extends BaseRequest {
  search?: string
  status?: string
  tier?: number
  ekycStatus?: string
  roleCode?: string
  fromCreatedAt?: string
  toCreatedAt?: string
}

export interface AdminCreateUserRequest {
  email: string
  password: string
  fullName: string
  phoneNumber: string
  identityNumber?: string
  dob?: string
  hometown?: string
  tier?: number
  riskScore?: number
  status?: string
  roleCodes?: string[]
}

export interface AdminUpdateUserRequest {
  fullName?: string
  identityNumber?: string
  dob?: string
  hometown?: string
  tier?: number
  riskScore?: number
  ekycStatus?: string
  roleCodes?: string[]
}

export interface AdminUpdateUserStatusRequest {
  status: string
  reason?: string
}

export interface AdminResetPasswordRequest {
  newPassword: string
}

export interface AdminResetPinRequest {
  newPin?: string | null
}

export interface AdminUserSummaryResponse {
  id: string
  email: string
  phoneNumber: string
  fullName: string
  identityNumber?: string
  status: string
  tier: number
  riskScore?: number
  ekycStatus?: string
  failedLoginAttempts: number
  pinFailedAttempts: number
  roleCodes: string[]
  createdAt: string
  lastLoginAt?: string
}

export interface WalletInfo {
  walletId: string
  balance: number
  availableBalance: number
  holdingBalance: number
  walletStatus: string
  limitation: number
}

export interface AdminUserDetailResponse {
  id: string
  email: string
  phoneNumber: string
  fullName: string
  identityNumber?: string
  dob?: string
  hometown?: string
  status: string
  tier: number
  riskScore?: number
  failedLoginAttempts: number
  pinFailedAttempts: number
  hasPin: boolean
  ekycStatus?: string
  ekycRegisteredAt?: string
  roleCodes: string[]
  permissionCodes: string[]
  wallet?: WalletInfo | null
  createdAt: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  lastLoginAt?: string
}
