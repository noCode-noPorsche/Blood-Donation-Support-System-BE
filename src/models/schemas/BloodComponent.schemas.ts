import { ObjectId } from 'mongodb'
import { BloodComponentEnum } from '~/constants/enum'

interface BloodComponentType {
  _id?: ObjectId
  name: BloodComponentEnum
  created_at?: Date
  updated_at?: Date
}

export default class BloodComponent {
  _id?: ObjectId
  name: BloodComponentEnum
  created_at?: Date
  updated_at?: Date
  constructor(bloodComponent: BloodComponentType) {
    const date = new Date()
    this._id = bloodComponent._id
    this.name = bloodComponent.name
    this.created_at = bloodComponent.created_at || date
    this.updated_at = bloodComponent.updated_at || date
  }
}
