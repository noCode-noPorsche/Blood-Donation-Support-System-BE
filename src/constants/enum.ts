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

export enum BloodGroupEnum {
  APositive = 'A+',
  ANegative = 'A-',
  BPositive = 'B+',
  BNegative = 'B-',
  ABPositive = 'AB+',
  ABNegative = 'AB-',
  OPositive = 'O+',
  ONegative = 'O-'
}

export enum BloodComponentEnum {
  RedBloodCells = 'Red Blood Cells',
  WhiteBloodCells = 'White Blood Cells',
  Platelets = 'Platelets',
  Plasma = 'Plasma'
}

export enum DonationRegisterStatus {
  CheckedIn = 'Checked In',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum DonationProcessStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum HealthCheckStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
  Pending = 'Pending'
}

export enum UnderlyingHealthCondition {
  Diabetes = 'Diabetes',
  Hypertension = 'Hypertension',
  HeartDisease = 'Heart Disease',
  Cancer = 'Cancer',
  Thalassemia = 'Thalassemia',
  Hemophilia = 'Hemophilia',
  Epilepsy = 'Epilepsy',
  ActivePulmonaryTuberculosis = 'Active pulmonary tuberculosis',
  SevereAnemia = 'Severe anemia',
  SevereNeurologicalDisorder = 'Severe neurological disorder',
  HIV = 'HIV/AIDS',
  HepatitisBorC = 'Hepatitis B or C',
  None = 'None'
}
