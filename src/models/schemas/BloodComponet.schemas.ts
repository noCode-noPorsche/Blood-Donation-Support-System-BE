import { ObjectId } from 'mongodb'

interface BloodComponentType {
  _id?: ObjectId
  name: BloodComponent
}

export default class BloodComponent {
  _id?: ObjectId
  name: BloodComponent
  constructor(bloodComponent: BloodComponentType) {
    this._id = bloodComponent._id
    this.name = bloodComponent.name
  }
}
