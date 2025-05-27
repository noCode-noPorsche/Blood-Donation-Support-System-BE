import { BLOOD_MESSAGES } from '~/constants/messages'
import databaseService from './database.services'
import { BloodComponentEnum, BloodGroupEnum } from '~/constants/enum'
import BloodGroup from '~/models/schemas/BloodGroup.schemas'
import BloodComponent from '~/models/schemas/BloodComponent.schemas'

class BloodService {
  async getBloodGroups() {
    const bloodGroups = await databaseService.bloodGroups.find({}).toArray()
    return bloodGroups
  }
  async createBloodGroup(name: BloodGroupEnum) {
    await databaseService.bloodGroups.insertOne(new BloodGroup({ name }))
    return {
      message: BLOOD_MESSAGES.CREATE_BLOOD_GROUP_SUCCESS
    }
  }

  async getBloodComponents() {
    const bloodComponents = await databaseService.bloodComponents.find({}).toArray()
    return bloodComponents
  }

  async createBloodComponent(name: BloodComponentEnum) {
    await databaseService.bloodComponents.insertOne(new BloodComponent({ name }))
    return {
      message: BLOOD_MESSAGES.CREATE_BLOOD_COMPONENT_SUCCESS
    }
  }

  async isBloodGroupExist(name: BloodGroupEnum) {
    const bloodGroup = await databaseService.bloodGroups.findOne({ name })
    return !!bloodGroup
  }

  async isBloodComponentExist(name: BloodComponentEnum) {
    const bloodComponent = await databaseService.bloodComponents.findOne({ name })
    return !!bloodComponent
  }
}

const bloodService = new BloodService()
export default bloodService
