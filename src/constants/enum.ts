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
  StaffWarehouse = 'Staff Warehouse',
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
  WholeBlood = 'Whole Blood',
  RedBloodCells = 'Red Blood Cells',
  WhiteBloodCells = 'White Blood Cells',
  Platelets = 'Platelets',
  Plasma = 'Plasma'
}

export enum BloodUnitStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Used = 'Used',
  Expired = 'Expired',
  Damaged = 'Damaged'
}

export enum DonationRegistrationStatus {
  CheckedIn = 'Checked In',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum DonationType {
  WholeBlood = 'Whole Blood', // Hiến máu toàn phần
  Platelets = 'Platelets', // Hiến tiểu cầu
  Plasma = 'Plasma', // Hiến huyết tương
  RedBloodCells = 'Red Blood Cells', // Hiến hồng cầu kép

  PlateletsPlasma = 'Platelets - Plasma', // Hiến tiểu cầu + huyết tương
  PlasmaRedCells = 'Plasma - Red Blood Cells', // Hiến huyết tương + hồng cầu
  PlateletsRedCells = 'Platelets - Red Blood Cells' // Hiến tiểu cầu + hồng cầu
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

export enum RequestRegistrationStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum RequestType {
  WholeBlood = 'Whole Blood', // Hiến máu toàn phần
  Platelets = 'Platelets', // Hiến tiểu cầu
  Plasma = 'Plasma', // Hiến huyết tương
  RedBloodCells = 'Red Blood Cells', // Hiến hồng cầu kép

  PlateletsPlasma = 'Platelets - Plasma', // Hiến tiểu cầu + huyết tương
  PlasmaRedCells = 'Plasma - Red Blood Cells', // Hiến huyết tương + hồng cầu
  PlateletsRedCells = 'Platelets - Red Blood Cells' // Hiến tiểu cầu + hồng cầu
}

export enum RequestProcessStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum RequestProcessBloodStatus {
  Pending = 'Pending',
  Selected = 'Selected',
  Canceled = 'Canceled',
  Done = 'Done'
}

export enum RequestProcessDetailStatus {
  Pending = 'Pending',
  Matched = 'Matched',
  Canceled = 'Canceled'
}
