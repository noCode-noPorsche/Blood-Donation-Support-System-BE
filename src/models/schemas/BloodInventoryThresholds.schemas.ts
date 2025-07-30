import { ObjectId } from 'mongodb'

interface BloodInventoryThresholdType {
  _id: ObjectId
  blood_group_id: ObjectId // 8 nhóm máu
  blood_component_id: ObjectId // 3 thành phần máu
  threshold_unit: number // Ngưỡng an toàn theo số túi
  threshold_volume_ml: number // Ngưỡng an toàn theo tổng volume (ml)
  threshold_unit_stable: number
  created_at: Date
  updated_at: Date
  updated_by: ObjectId
  is_stable: boolean
}

export default class BloodInventoryThreshold {
  _id: ObjectId
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  threshold_unit: number
  threshold_volume_ml: number
  threshold_unit_stable: number
  created_at: Date
  updated_at: Date
  updated_by: ObjectId
  is_stable: boolean

  constructor(bloodInventoryThreshold: BloodInventoryThresholdType) {
    const date = new Date()
    this._id = bloodInventoryThreshold._id
    this.blood_group_id = bloodInventoryThreshold.blood_group_id
    this.blood_component_id = bloodInventoryThreshold.blood_component_id
    this.threshold_unit = bloodInventoryThreshold.threshold_unit
    this.threshold_volume_ml = bloodInventoryThreshold.threshold_volume_ml
    this.threshold_unit_stable = bloodInventoryThreshold.threshold_unit_stable
    this.created_at = bloodInventoryThreshold.created_at || date
    this.updated_at = bloodInventoryThreshold.updated_at || date
    this.updated_by = bloodInventoryThreshold.updated_by
    this.is_stable = bloodInventoryThreshold.is_stable
  }
}
