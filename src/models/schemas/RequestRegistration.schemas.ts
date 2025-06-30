import { ObjectId } from 'mongodb'
import { RequestRegistrationStatus } from '~/constants/enum'

interface RequestRegistrationType {
  _id?: ObjectId
  user_id: ObjectId
  request_process_id?: ObjectId
  health_check_id?: ObjectId
  status: RequestRegistrationStatus
  blood_group_id: ObjectId | null
  blood_component_ids?: ObjectId[] | null
  image?: string
  receive_date_request: Date
  update_by: ObjectId
  created_at: Date
  updated_at: Date
  is_emergency: boolean
  note?: string
}

export default class RequestRegistration {
  _id?: ObjectId
  user_id: ObjectId
  request_process_id?: ObjectId
  health_check_id?: ObjectId
  status: RequestRegistrationStatus
  blood_group_id: ObjectId | null
  blood_component_ids?: ObjectId[] | null
  image?: string
  receive_date_request: Date
  update_by: ObjectId
  created_at: Date
  updated_at: Date
  is_emergency: boolean
  note?: string
  constructor(requestRegistration: RequestRegistrationType) {
    const date = new Date()
    this._id = requestRegistration._id || new ObjectId()
    this.user_id = requestRegistration.user_id
    this.health_check_id = requestRegistration.health_check_id || new ObjectId()
    this.request_process_id = requestRegistration.request_process_id
    this.status = requestRegistration.status || RequestRegistrationStatus.Pending
    this.blood_group_id = requestRegistration.blood_group_id || null
    this.blood_component_ids = requestRegistration.blood_component_ids || null
    this.receive_date_request = requestRegistration.receive_date_request || date
    this.image = requestRegistration.image || ''
    this.update_by = requestRegistration.update_by
    this.created_at = requestRegistration.created_at || date
    this.updated_at = requestRegistration.updated_at || date
    this.is_emergency = requestRegistration.is_emergency || false
    this.note = requestRegistration.note || ''
  }
}
