import { ObjectId } from 'mongodb'
import { RequestProcessBloodStatus } from '~/constants/enum'

interface RequestProcessBloodType {
  _id?: ObjectId
  request_process_id: ObjectId
  request_process_detail_id: ObjectId
  blood_component_id: ObjectId
  blood_group_id: ObjectId
  volume: number
  blood_unit_id?: ObjectId
  status: RequestProcessBloodStatus
  updated_by: ObjectId
  created_at: Date
  updated_at: Date
}

export default class RequestProcessBlood {
  _id?: ObjectId
  request_process_id: ObjectId
  request_process_detail_id: ObjectId
  blood_component_id: ObjectId
  blood_group_id: ObjectId
  volume: number
  blood_unit_id?: ObjectId
  status: RequestProcessBloodStatus
  updated_by: ObjectId
  created_at: Date
  updated_at: Date
  constructor(requestProcessBlood: RequestProcessBloodType) {
    const date = new Date()
    this._id = requestProcessBlood._id || new ObjectId()
    this.request_process_id = requestProcessBlood.request_process_id
    this.request_process_detail_id = requestProcessBlood.request_process_detail_id
    this.blood_component_id = requestProcessBlood.blood_component_id
    this.blood_group_id = requestProcessBlood.blood_group_id
    this.volume = requestProcessBlood.volume || 0
    this.blood_unit_id = requestProcessBlood.blood_unit_id
    this.status = requestProcessBlood.status || RequestProcessBloodStatus.Pending
    this.updated_by = requestProcessBlood.updated_by
    this.created_at = requestProcessBlood.created_at || date
    this.updated_at = requestProcessBlood.updated_at || date
  }
}
