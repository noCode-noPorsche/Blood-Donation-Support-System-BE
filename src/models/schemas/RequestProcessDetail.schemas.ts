import { ObjectId } from 'mongodb'
import { RequestProcessDetailStatus } from '~/constants/enum'

interface RequestProcessDetailType {
  _id?: ObjectId
  request_process_id: ObjectId
  blood_component_id: ObjectId
  blood_group_id: ObjectId
  volume_required: number
  status: RequestProcessDetailStatus
  updated_by: ObjectId
  created_at: Date
  updated_at: Date
}

export default class RequestProcessDetail {
  _id?: ObjectId
  request_process_id: ObjectId
  blood_component_id: ObjectId
  blood_group_id: ObjectId
  volume_required: number
  status: RequestProcessDetailStatus
  updated_by: ObjectId
  created_at: Date
  updated_at: Date
  constructor(requestProcessDetail: RequestProcessDetailType) {
    const date = new Date()
    this._id = requestProcessDetail._id || new ObjectId()
    this.request_process_id = requestProcessDetail.request_process_id
    this.blood_component_id = requestProcessDetail.blood_component_id
    this.blood_group_id = requestProcessDetail.blood_group_id
    this.volume_required = requestProcessDetail.volume_required || 0
    this.status = requestProcessDetail.status || RequestProcessDetailStatus.Pending
    this.updated_by = requestProcessDetail.updated_by
    this.created_at = requestProcessDetail.created_at || date
    this.updated_at = requestProcessDetail.updated_at || date
  }
}
