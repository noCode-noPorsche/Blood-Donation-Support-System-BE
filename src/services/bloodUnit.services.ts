import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { BloodComponentEnum } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { BLOOD_MESSAGES, DONATION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { UpdateBloodUnitsReqBody } from '~/models/requests/BloodUnit.requests'
import { getExpirationDateByComponent } from '~/utils/utils'
import databaseService from './database.services'
config()

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

    const totalVolume = payload.reduce((sum, p) => sum + p.volume, 0)

    const donationProcess = await databaseService.donationProcesses.findOne({
      _id: new ObjectId(id)
    })

    if (!donationProcess) {
      throw new ErrorWithStatus({ message: 'Không tìm thấy quy trình hiến máu', status: HTTP_STATUS.NOT_FOUND })
    }

    if (totalVolume !== donationProcess.volume_collected) {
      throw new ErrorWithStatus({
        message: 'Tổng thể tích không khớp với lượng máu đã lấy',
        status: HTTP_STATUS.BAD_REQUEST
      })
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
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      const componentName = componentIdToNameMap.get(updateItem.blood_component_id)

      const expired_at = getExpirationDateByComponent(componentName as BloodComponentEnum)

      if (!componentName) {
        throw new ErrorWithStatus({
          message: `Không tìm thấy tên thành phần máu tương ứng với ID: ${updateItem.blood_component_id}`,
          status: HTTP_STATUS.NOT_FOUND
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
    const bloodUnitResults = await databaseService.bloodUnits
      .aggregate([
        // 1. Match theo donation_process_id
        {
          $match: {
            donation_process_id: new ObjectId(id)
          }
        },

        // 2. Join blood_groups
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group_info'
          }
        },
        {
          $unwind: {
            path: '$blood_group_info',
            preserveNullAndEmptyArrays: true
          }
        },

        // 3. Join blood_components
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component_info'
          }
        },
        {
          $unwind: {
            path: '$blood_component_info',
            preserveNullAndEmptyArrays: true
          }
        },

        // 4. Project kết quả mong muốn
        {
          $project: {
            _id: 1,
            donation_process_id: 1,
            request_process_id: 1,
            blood_group_id: 1,
            blood_component_id: 1,
            status: 1,
            expired_at: 1,
            volume: 1,
            update_by: 1,
            updated_by: 1,
            created_at: 1,
            updated_at: 1,

            // bổ sung tên nhóm máu và thành phần máu
            blood_group_name: '$blood_group_info.name',
            blood_component_name: '$blood_component_info.name'
          }
        }
      ])
      .toArray()

    if (!bloodUnitResults || bloodUnitResults.length === 0) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND,
        status: 404
      })
    }

    return bloodUnitResults
  }

  async getAllBloodUnits() {
    const bloodUnitResults = await databaseService.bloodUnits
      .aggregate([
        // 1. Join blood_groups để lấy tên nhóm máu
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group_info'
          }
        },
        {
          $unwind: {
            path: '$blood_group_info',
            preserveNullAndEmptyArrays: true
          }
        },

        // 2. Join blood_components để lấy tên thành phần máu
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component_info'
          }
        },
        {
          $unwind: {
            path: '$blood_component_info',
            preserveNullAndEmptyArrays: true
          }
        },

        // 3. Project kết quả trả về
        {
          $project: {
            _id: 1,
            donation_process_id: 1,
            request_process_id: 1,
            blood_group_id: 1,
            blood_component_id: 1,
            status: 1,
            expired_at: 1,
            volume: 1,
            update_by: 1,
            updated_by: 1,
            created_at: 1,
            updated_at: 1,

            // Thêm tên vào kết quả
            blood_group_name: '$blood_group_info.name',
            blood_component_name: '$blood_component_info.name'
          }
        }
      ])
      .toArray()

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
