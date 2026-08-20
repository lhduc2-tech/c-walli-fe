export interface LoginRequest {
  phoneNumber: string
  password: string
}

export interface AuthResponse {
  accessToken?: string
  tokenType?: string
  user?: {
    id: string
    email: string
    phoneNumber: string
    fullName: string
    status: string
    roles: string[]
    permissions?: string[]
  }
}

export interface UserProfileResponse {
  fullName: string
  identityNumber?: string
  dob?: string
  hometown?: string
  email: string
  phoneNumber: string
  tier?: number
  riskScore?: number
}
