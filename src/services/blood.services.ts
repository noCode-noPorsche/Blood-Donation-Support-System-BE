import { ObjectId } from 'mongodb'
import { BloodComponentEnum, BloodGroupEnum } from '~/constants/enum'
import { BLOOD_MESSAGES } from '~/constants/messages'
import BloodComponent from '~/models/schemas/BloodComponent.schemas'
import BloodGroup from '~/models/schemas/BloodGroup.schemas'
import databaseService from './database.services'
import { config } from 'dotenv'
import { ErrorWithStatus } from '~/models/Error'
import { HTTP_STATUS } from '~/constants/httpStatus'
config()

class BloodService {
  async getBloodGroups() {
    const bloodGroups = await databaseService.bloodGroups.find({}).toArray()
    return bloodGroups
  }

  async getBloodGroupNameById(id: string) {
    const bloodGroupResult = await databaseService.bloodGroups.findOne({ _id: new ObjectId(id) })
    if (!bloodGroupResult) {
      throw new ErrorWithStatus({
        message: BLOOD_MESSAGES.BLOOD_GROUP_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return bloodGroupResult.name
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

  async getBloodComponentNameById(id: string) {
    const bloodComponentResult = await databaseService.bloodComponents.findOne({ _id: new ObjectId(id) })
    if (!bloodComponentResult) {
      throw new ErrorWithStatus({
        message: BLOOD_MESSAGES.BLOOD_COMPONENT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return bloodComponentResult.name
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

  async isBloodGroupIdExist(id: string) {
    const bloodGroup = await databaseService.bloodGroups.findOne({ _id: new ObjectId(id) })
    return !!bloodGroup
  }

  async isBloodComponentIdExist(id: string) {
    const bloodComponent = await databaseService.bloodComponents.findOne({ _id: new ObjectId(id) })
    return !!bloodComponent
  }
}

const bloodService = new BloodService()
export default bloodService
