import { ObjectId } from 'mongodb'
import { UserGender, UserRole } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  full_name: string
  email: string
  date_of_birth: Date
  password: string
  role: UserRole
  gender: UserGender
  citizen_id_number: string | null
  blood_group_id?: ObjectId | null
  number_of_donations?: number
  number_of_requests?: number
  weight: number
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
  address?: string
  phone: string
  avatar_url?: string
  created_at?: Date
  updated_at?: Date
  forgot_password_token?: string
  fcm_token?: string
  is_active: boolean
}

export default class User {
  _id?: ObjectId
  full_name: string
  email: string
  date_of_birth: Date
  password: string
  role: UserRole
  gender: UserGender
  citizen_id_number: string | null
  blood_group_id?: ObjectId | null
  number_of_donations?: number
  number_of_requests?: number
  weight: number
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  address?: string
  phone: string
  avatar_url: string
  created_at: Date
  updated_at: Date
  forgot_password_token: string
  fcm_token?: string
  is_active: boolean
  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.full_name = user.full_name
    this.email = user.email
    this.date_of_birth = user.date_of_birth || new Date()
    this.password = user.password
    this.role = user.role || UserRole.Customer
    this.gender = user.gender || UserGender.Other
    this.citizen_id_number = user.citizen_id_number || null
    this.blood_group_id = user.blood_group_id || null
    this.number_of_donations = user.number_of_donations || 0
    this.number_of_requests = user.number_of_requests || 0
    this.weight = user.weight || 0
    this.location = user.location || {
      type: 'Point',
      coordinates: [0, 0]
    }
    this.address = user.address || ''
    this.phone = user.phone || ''
    this.avatar_url = user.avatar_url || ''
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.forgot_password_token = user.forgot_password_token || ''
    this.fcm_token = user.fcm_token || ''
    this.is_active = user.is_active || true
  }
}
