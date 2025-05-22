export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum UserGender {
  Other = 'Other',
  Male = 'Male',
  Female = 'Female'
}

export enum UserRole {
  Admin = 'Admin',
  Staff = 'Staff',
  Customer = 'Customer'
}
