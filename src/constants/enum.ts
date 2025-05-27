export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken
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

export enum BloodGroup {
  APositive = 'A+',
  ANegative = 'A-',
  BPositive = 'B+',
  BNegative = 'B-',
  ABPositive = 'AB+',
  ABNegative = 'AB-',
  OPositive = 'O+',
  ONegative = 'O-'
}

export enum BloodComponent {
  RedBloodCells = 'Red Blood Cells',
  WhiteBloodCells = 'White Blood Cells',
  Platelets = 'Platelets',
  Plasma = 'Plasma'
}
