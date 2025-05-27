import BloodGroup from '~/models/schemas/BloodGroup.schemas'
import databaseService from './database.services'

class BloodService {
  async getBloodGroups() {
    const bloodGroups = await databaseService.bloodGroups.find({}).toArray()
    return bloodGroups
  }
  async createBloodGroup(name: BloodGroup) {
    const bloodGroup = await databaseService.bloodGroups.insertOne({ name })
    return bloodGroup
  }
}

const bloodService = new BloodService()
export default bloodService
