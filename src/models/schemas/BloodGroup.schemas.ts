import { ObjectId } from 'mongodb'

interface BloodGroupType {
  _id?: ObjectId
  name: BloodGroup
}

export default class BloodGroup {
  _id?: ObjectId
  name: BloodGroup
  constructor(bloodGroup: BloodGroupType) {
    this._id = bloodGroup._id
    this.name = bloodGroup.name
  }
}
