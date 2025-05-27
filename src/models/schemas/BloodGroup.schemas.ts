import { ObjectId } from 'mongodb'
import { BloodGroupEnum } from '~/constants/enum'

interface BloodGroupType {
  _id?: ObjectId
  name: BloodGroupEnum
  created_at?: Date
  updated_at?: Date
}

export default class BloodGroup {
  _id?: ObjectId
  name: BloodGroupEnum
  created_at?: Date
  updated_at?: Date
  constructor(bloodGroup: BloodGroupType) {
    const date = new Date()
    this._id = bloodGroup._id
    this.name = bloodGroup.name
    this.created_at = bloodGroup.created_at || date
    this.updated_at = bloodGroup.updated_at || date
  }
}
