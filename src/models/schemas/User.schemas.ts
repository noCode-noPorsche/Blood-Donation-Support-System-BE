import { ObjectId } from 'mongodb'
import { UserGender, UserRole, UserVerifyStatus } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  full_name: string
  email: string
  date_of_birth: Date
  password: string
  role: UserRole
  gender: UserGender
  blood_group_id?: ObjectId
  number_of_donation?: number
  number_of_request?: number
  weight: number
  location?: string
  phone: string
  avatar_url?: string
  created_at?: Date
  updated_at?: Date

  email_verify_token?: string //jwt hoặc "" nếu đã xác thực email
  forgot_password_token?: string //jwt hoặc "" nếu đã xác thực email
  verify?: UserVerifyStatus
}

export default class User {
  _id?: ObjectId
  full_name: string
  email: string
  date_of_birth: Date
  password: string
  role: UserRole
  gender: UserGender
  blood_group_id?: ObjectId
  number_of_donation?: number
  number_of_request?: number
  weight: number
  location: string
  phone: string
  avatar_url: string
  created_at: Date
  updated_at: Date

  email_verify_token: string //jwt hoặc "" nếu đã xác thực email
  forgot_password_token: string //jwt hoặc "" nếu đã xác thực email
  verify: UserVerifyStatus

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.full_name = user.full_name
    this.email = user.email
    this.date_of_birth = user.date_of_birth || new Date()
    this.password = user.password
    this.role = user.role || UserRole.Customer
    this.gender = user.gender || UserGender.Other
    this.blood_group_id = user.blood_group_id
    this.number_of_donation = user.number_of_donation || 0
    this.number_of_request = user.number_of_request || 0
    this.weight = user.weight || 0
    this.location = user.location || ''
    this.phone = user.phone || ''
    this.avatar_url = user.avatar_url || ''
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date

    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
  }
}
