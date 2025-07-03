import { ObjectId } from 'mongodb'
import { BloodUnitStatus } from '~/constants/enum'

interface BloodUnitType {
  _id?: ObjectId
  donation_process_id: ObjectId
  request_process_id: ObjectId | null
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  updated_by: ObjectId
  status: BloodUnitStatus
  expired_at?: Date
  volume?: number
  storage_temperature?: number
  note?: string
  used_at?: Date | null
  created_at?: Date
  updated_at?: Date
}
export default class BloodUnit {
  _id?: ObjectId
  donation_process_id?: ObjectId
  request_process_id?: ObjectId | null
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  status: BloodUnitStatus
  expired_at?: Date | null
  volume?: number
  storage_temperature?: number
  note?: string
  updated_by?: ObjectId
  used_at?: Date | null
  created_at?: Date
  updated_at?: Date
  constructor(bloodUnit: BloodUnitType) {
    const date = new Date()
    this._id = bloodUnit._id || new ObjectId()
    this.donation_process_id = bloodUnit.donation_process_id || ''
    this.request_process_id = bloodUnit.request_process_id || null
    this.blood_group_id = bloodUnit.blood_group_id || ''
    this.blood_component_id = bloodUnit.blood_component_id || ''
    this.updated_by = bloodUnit.updated_by || ''
    this.status = bloodUnit.status || BloodUnitStatus.Available
    this.expired_at = bloodUnit.expired_at || null
    this.volume = bloodUnit.volume || 0
    this.storage_temperature = bloodUnit.storage_temperature || 0
    this.note = bloodUnit.note || ''
    this.used_at = bloodUnit.used_at || null
    this.created_at = bloodUnit.created_at || date
    this.updated_at = bloodUnit.updated_at || date
  }
}
