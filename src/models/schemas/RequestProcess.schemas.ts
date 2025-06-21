import { ObjectId } from 'mongodb'
import { RequestProcessStatus } from '~/constants/enum'

interface RequestProcessType {
  _id?: ObjectId
  user_id: ObjectId
  request_registration_id?: ObjectId
  health_check_id?: ObjectId
  blood_group_id: ObjectId
  blood_component_ids: ObjectId[] | null
  volume_received?: number
  status: RequestProcessStatus
  is_emergency: boolean
  request_date?: Date
  description?: string
  update_by: ObjectId
  created_at: Date
  updated_at: Date
}
export default class RequestProcess {
  _id?: ObjectId
  user_id: ObjectId
  request_registration_id?: ObjectId
  health_check_id?: ObjectId
  blood_group_id: ObjectId
  blood_component_ids: ObjectId[] | null
  volume_received?: number
  status: RequestProcessStatus
  is_emergency: boolean
  request_date?: Date
  update_by: ObjectId
  created_at: Date
  updated_at: Date
  description?: string
  constructor(requestProcess: RequestProcessType) {
    const date = new Date()
    this._id = requestProcess._id || new ObjectId()
    this.user_id = requestProcess.user_id
    this.request_registration_id = requestProcess.request_registration_id
    this.health_check_id = requestProcess.health_check_id || new ObjectId()
    this.blood_group_id = requestProcess.blood_group_id || ''
    this.blood_component_ids = requestProcess.blood_component_ids || []
    this.volume_received = requestProcess.volume_received
    this.status = requestProcess.status || RequestProcessStatus.Pending
    this.is_emergency = requestProcess.is_emergency
    this.request_date = requestProcess.request_date || date
    this.update_by = requestProcess.update_by
    this.created_at = requestProcess.created_at || date
    this.updated_at = requestProcess.updated_at || date
    this.description = requestProcess.description || ''
  }
}
