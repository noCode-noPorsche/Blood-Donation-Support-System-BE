import { ObjectId } from 'mongodb'
import { BloodUnitStatus } from '~/constants/enum'

interface BloodUnitType {
  _id?: ObjectId
  donation_process_id: ObjectId
  request_process_id: ObjectId
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  update_by: ObjectId
  status: BloodUnitStatus
  expired_at?: Date
  volume?: number
  created_at?: Date
  updated_at?: Date
}

export default class BloodUnit {
  _id?: ObjectId
  donation_process_id?: ObjectId
  request_process_id?: ObjectId
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  status: BloodUnitStatus
  expired_at?: Date
  volume?: number
  update_by?: ObjectId
  created_at?: Date
  updated_at?: Date
  constructor(bloodUnit: BloodUnitType) {
    const date = new Date()
    this._id = bloodUnit._id || new ObjectId()
    this.donation_process_id = bloodUnit.donation_process_id || ''
    this.request_process_id = bloodUnit.request_process_id || ''
    this.blood_group_id = bloodUnit.blood_group_id || ''
    this.blood_component_id = bloodUnit.blood_component_id || ''
    this.update_by = bloodUnit.update_by || ''
    this.status = bloodUnit.status || BloodUnitStatus.Available
    this.expired_at = bloodUnit.expired_at || new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
    this.volume = bloodUnit.volume || 450
    this.created_at = bloodUnit.created_at || date
    this.updated_at = bloodUnit.updated_at || date
  }
}
