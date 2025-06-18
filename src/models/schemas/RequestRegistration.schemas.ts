import { ObjectId } from 'mongodb'
import { RequestRegistrationStatus } from '~/constants/enum'

interface RequestRegistrationType {
  _id?: ObjectId
  user_id: ObjectId
  request_process_id?: ObjectId
  health_check_id?: ObjectId
  status: RequestRegistrationStatus
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  image?: string
  receive_date_request: Date
  created_at: Date
  updated_at: Date
  is_emergency: boolean
}

export default class RequestRegistration {
  _id?: ObjectId
  user_id: ObjectId
  request_process_id?: ObjectId
  health_check_id?: ObjectId
  status: RequestRegistrationStatus
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  image?: string
  receive_date_request: Date
  created_at: Date
  updated_at: Date
  is_emergency: boolean
  constructor(requestRegistration: RequestRegistrationType) {
    const date = new Date()
    this._id = requestRegistration._id || new ObjectId()
    this.user_id = requestRegistration.user_id
    this.health_check_id = requestRegistration.health_check_id || new ObjectId()
    this.status = requestRegistration.status || RequestRegistrationStatus.Pending
    this.blood_group_id = requestRegistration.blood_group_id || ''
    this.blood_component_id = requestRegistration.blood_component_id || ''
    this.receive_date_request = requestRegistration.receive_date_request || date
    this.created_at = requestRegistration.created_at || date
    this.updated_at = requestRegistration.updated_at || date
    this.is_emergency = requestRegistration.is_emergency || false
  }
}
