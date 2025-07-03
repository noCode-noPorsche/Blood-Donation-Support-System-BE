import { ObjectId } from 'mongodb'
import { DonationType, HealthCheckStatus, RequestType, UnderlyingHealthCondition, UserRole } from '~/constants/enum'

interface HealthCheckType {
  _id?: ObjectId
  user_id: ObjectId
  blood_group_id: ObjectId
  blood_component_ids?: ObjectId[] | null
  donation_registration_id: ObjectId | null
  donation_process_id: ObjectId | null
  donation_type?: DonationType
  request_registration_id: ObjectId | null
  request_process_id: ObjectId | null
  request_type?: RequestType
  weight?: number
  temperature?: number
  heart_rate?: number
  diastolic_blood_pressure?: number
  systolic_blood_pressure?: number
  underlying_health_condition?: UnderlyingHealthCondition[]
  hemoglobin?: number
  status?: HealthCheckStatus
  description?: string
  updated_by: ObjectId
  created_at: Date
  updated_at: Date
}

export default class HealthCheck {
  _id?: ObjectId
  user_id: ObjectId
  blood_group_id: ObjectId
  blood_component_ids?: ObjectId[] | null
  donation_registration_id: ObjectId | null
  donation_process_id: ObjectId | null
  donation_type?: DonationType | null
  request_registration_id: ObjectId | null
  request_process_id: ObjectId | null
  request_type?: RequestType | null
  weight?: number
  temperature?: number
  heart_rate?: number
  diastolic_blood_pressure?: number
  systolic_blood_pressure?: number
  underlying_health_condition?: UnderlyingHealthCondition[]
  hemoglobin?: number
  status?: HealthCheckStatus
  description?: string
  updated_by: ObjectId
  created_at: Date
  updated_at: Date
  constructor(healthCheck: HealthCheckType) {
    const date = new Date()
    this._id = healthCheck._id || new ObjectId()
    this.user_id = healthCheck.user_id
    this.blood_group_id = healthCheck.blood_group_id
    this.blood_component_ids = healthCheck.blood_component_ids || null
    this.donation_registration_id = healthCheck.donation_registration_id || null
    this.donation_process_id = healthCheck.donation_process_id || null
    this.donation_type = healthCheck.donation_type ?? null
    this.request_registration_id = healthCheck.request_registration_id || null
    this.request_process_id = healthCheck.request_process_id || null
    this.request_type = healthCheck.request_type ?? null
    this.weight = healthCheck.weight || 0
    this.temperature = healthCheck.temperature || 0
    this.heart_rate = healthCheck.heart_rate || 0
    this.diastolic_blood_pressure = healthCheck.diastolic_blood_pressure || 0
    this.systolic_blood_pressure = healthCheck.systolic_blood_pressure || 0
    this.underlying_health_condition = healthCheck.underlying_health_condition || []
    this.hemoglobin = healthCheck.hemoglobin || 0
    this.status = healthCheck.status || HealthCheckStatus.Pending
    this.description = healthCheck.description || ''
    this.updated_by = healthCheck.updated_by
    this.created_at = healthCheck.created_at || date
    this.updated_at = healthCheck.updated_at || date
  }
}
