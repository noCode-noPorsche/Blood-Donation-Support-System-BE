import { ObjectId } from 'mongodb'
import { BloodComponentEnum } from '~/constants/enum'
import { BLOOD_MESSAGES, DONATION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { UpdateBloodUnitsReqBody } from '~/models/requests/BloodUnit.requests'
import { getExpirationDateByComponent } from '~/utils/utils'
import databaseService from './database.services'

class BloodUnitService {
  async updateBloodUnitsFromDonation({
    id,
    payload,
    user_id
  }: {
    id: string
    payload: UpdateBloodUnitsReqBody[]
    user_id: string
  }) {
    const bloodUnitsList = await databaseService.bloodUnits.find({ donation_process_id: new ObjectId(id) }).toArray()
    console.log('first', payload)

    const totalVolume = payload.reduce((sum, p) => sum + p.volume, 0)

    const donationProcess = await databaseService.donationProcesses.findOne({
      _id: new ObjectId(id)
    })

    if (!donationProcess) {
      throw new ErrorWithStatus({ message: 'Không tìm thấy quy trình hiến máu', status: 404 })
    }

    if (totalVolume !== donationProcess.volume_collected) {
      throw new ErrorWithStatus({ message: 'Tổng thể tích không khớp với lượng máu đã lấy', status: 400 })
    }

    const allComponents = await databaseService.bloodComponents.find().toArray()
    const componentIdToNameMap = new Map(allComponents.map((c) => [c._id.toString(), c.name]))

    // Tiến hành cập nhật từng blood unit
    const updatedBloodUnits = []

    for (const updateItem of payload) {
      const targetUnit = bloodUnitsList.find(
        (unit) => unit.blood_component_id.toString() === updateItem.blood_component_id
      )

      if (!targetUnit) {
        throw new ErrorWithStatus({
          message: `Không tìm thấy thành phần máu có ID: ${updateItem.blood_component_id}`,
          status: 404
        })
      }

      const componentName = componentIdToNameMap.get(updateItem.blood_component_id)

      const expired_at = getExpirationDateByComponent(componentName as BloodComponentEnum)

      if (!componentName) {
        throw new ErrorWithStatus({
          message: `Không tìm thấy tên thành phần máu tương ứng với ID: ${updateItem.blood_component_id}`,
          status: 404
        })
      }

      const result = await databaseService.bloodUnits.findOneAndUpdate(
        { _id: targetUnit._id },
        {
          $set: {
            volume: updateItem.volume,
            status: updateItem.status,
            blood_group_id: new ObjectId(updateItem.blood_group_id),
            expired_at: expired_at,
            update_by: new ObjectId(user_id)
          },
          $currentDate: { updated_at: true }
        },
        {
          returnDocument: 'after'
        }
      )

      if (result) {
        updatedBloodUnits.push(result)
      }
    }

    return updatedBloodUnits
  }

  async getBloodUnitsByDonationProcessId(id: string) {
    const bloodUnitResults = await databaseService.bloodUnits.find({ donation_process_id: new ObjectId(id) }).toArray()
    if (!bloodUnitResults) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND,
        status: 404
      })
    }
    return bloodUnitResults
  }

  async getAllBloodUnits() {
    const bloodUnitResults = await databaseService.bloodUnits.find({}).toArray()
    if (!bloodUnitResults) {
      throw new ErrorWithStatus({
        message: BLOOD_MESSAGES.GET_BLOOD_UNITS_FAIL,
        status: 404
      })
    }
    return bloodUnitResults
  }
}

const bloodUnitService = new BloodUnitService()
export default bloodUnitService
