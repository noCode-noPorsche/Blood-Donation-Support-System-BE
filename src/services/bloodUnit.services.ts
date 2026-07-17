import { config } from 'dotenv'
import { Filter, ObjectId } from 'mongodb'
import { BloodComponentEnum, BloodUnitStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { BLOOD_MESSAGES, DONATION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  BloodUnitsFilter,
  UpdateBloodUnitsFromDonationReqBody,
  UpdateStatusBloodUnitsReqBody
} from '~/models/requests/BloodUnit.requests'
import { bloodGroupMap, getExpirationDateByComponent } from '~/utils/utils'
import { UserRole } from '../constants/enum'
import bloodService from './blood.services'
import databaseService from './database.services'
import BloodUnit from '~/models/schemas/BloodUnit.schemas'
config()

class BloodUnitService {
  async updateBloodUnitsFromDonationProcess({
    id,
    payload,
    user_id
  }: {
    id: string
    payload: UpdateBloodUnitsFromDonationReqBody[]
    user_id: string
  }) {
    const bloodUnitsList = await databaseService.bloodUnits.find({ donation_process_id: new ObjectId(id) }).toArray()

    const totalVolume = payload.reduce((sum, p) => sum + p.volume, 0)

    const donationProcess = await databaseService.donationProcesses.findOne({
      _id: new ObjectId(id)
    })

    if (!donationProcess) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
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
            updated_by: new ObjectId(user_id),
            note: updateItem.note,
            storage_temperature: updateItem.storage_temperature
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

    // Cập nhật is_separated = true cho donation process
    await databaseService.donationProcesses.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          is_separated: true
        }
      }
    )

    return updatedBloodUnits
  }

  // Lấy danh Blood Unit By Donation Process Id
  async getBloodUnitsByDonationProcessId({
    id,
    filter,
    limit,
    page
  }: {
    id: string
    filter: BloodUnitsFilter
    limit: number
    page: number
  }) {
    const donationProcess = await databaseService.donationProcesses.findOne({
      _id: new ObjectId(id)
    })

    // Kiểm tra có tồn tại ko
    if (!donationProcess) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const finalFilter = {
      ...filter,
      donation_process_id: new ObjectId(id)
    }

    const bloodUnits = await databaseService.bloodUnits
      .aggregate([
        {
          $match: finalFilter
        },
        // Join User
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'user_update'
          }
        },
        { $unwind: { path: '$user_update', preserveNullAndEmptyArrays: true } },
        // Join Blood Group
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group'
          }
        },
        {
          $unwind: {
            path: '$blood_group',
            preserveNullAndEmptyArrays: true
          }
        },
        // Join Blood Components
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component'
          }
        },
        {
          $unwind: {
            path: '$blood_component',
            preserveNullAndEmptyArrays: true
          }
        },
        // Join Health Check
        {
          $lookup: {
            from: 'health_checks',
            localField: 'donation_process_id',
            foreignField: 'donation_process_id',
            as: 'health_check'
          }
        },
        {
          $unwind: {
            path: '$health_check',
            preserveNullAndEmptyArrays: true
          }
        },
        // Final Group
        {
          $group: {
            _id: '$_id',
            // Donation Process
            donation_process_id: { $first: '$donation_process_id' },
            // Request Process
            request_process_id: { $first: '$request_process_id' },
            // Blood Group
            blood_group_id: { $first: '$blood_group_id' },
            blood_group: { $first: '$blood_group.name' },
            // Blood Component
            blood_component_id: { $first: '$blood_component_id' },
            blood_component: { $first: '$blood_component.name' },
            // Main Blood Unit
            donation_type: { $first: '$health_check.donation_type' },
            volume: { $first: '$volume' },
            expired_at: { $first: '$expired_at' },
            storage_temperature: { $first: '$storage_temperature' },
            note: { $first: '$note' },
            status: { $first: '$status' },
            // Actor
            updated_by: { $first: '$user_update.full_name' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' }
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const totalItems = await databaseService.bloodUnits.countDocuments(finalFilter)
    const totalPages = Math.ceil(totalItems / limit)

    return {
      totalItems,
      limit,
      page,
      totalPages,
      items: bloodUnits
    }
  }

  async getAllBloodUnits({ filter, limit, page }: { filter: BloodUnitsFilter; limit: number; page: number }) {
    const bloodUnits = await databaseService.bloodUnits
      .aggregate([
        {
          $match: filter
        },
        // Join User
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'user_update'
          }
        },
        { $unwind: { path: '$user_update', preserveNullAndEmptyArrays: true } },
        // Join Blood Group
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group'
          }
        },
        {
          $unwind: {
            path: '$blood_group',
            preserveNullAndEmptyArrays: true
          }
        },
        // Join Blood Components
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component'
          }
        },
        {
          $unwind: {
            path: '$blood_component',
            preserveNullAndEmptyArrays: true
          }
        },
        // Join Health Check
        {
          $lookup: {
            from: 'health_checks',
            localField: 'donation_process_id',
            foreignField: 'donation_process_id',
            as: 'health_check'
          }
        },
        {
          $unwind: {
            path: '$health_check',
            preserveNullAndEmptyArrays: true
          }
        },
        // Final Group
        {
          $group: {
            _id: '$_id',
            // Donation Process
            donation_process_id: { $first: '$donation_process_id' },
            // Request Process
            request_process_id: { $first: '$request_process_id' },
            // Blood Group
            blood_group_id: { $first: '$blood_group_id' },
            blood_group: { $first: '$blood_group.name' },
            // Blood Component
            blood_component_id: { $first: '$blood_component_id' },
            blood_component: { $first: '$blood_component.name' },
            // Main Blood Unit
            donation_type: { $first: '$health_check.donation_type' },
            volume: { $first: '$volume' },
            expired_at: { $first: '$expired_at' },
            storage_temperature: { $first: '$storage_temperature' },
            note: { $first: '$note' },
            status: { $first: '$status' },
            // Actor
            updated_by: { $first: '$user_update.full_name' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' }
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const totalItems = await databaseService.bloodUnits.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / limit)

    return {
      totalItems,
      limit,
      page,
      totalPages,
      items: bloodUnits
    }
  }

  async getAllBloodUnitsRelative({
    blood_group_id,
    blood_component_ids,
    filter,
    limit,
    page
  }: {
    blood_group_id: string
    blood_component_ids: string[]
    filter: BloodUnitsFilter
    limit: number
    page: number
  }) {
    // Lấy tên nhóm máu người nhận
    const receiverName = await bloodService.getBloodGroupNameById(blood_group_id)

    // Dò map máu tương thích
    const compatibleDonorNames = bloodGroupMap[receiverName] || []

    // Lấy danh sách nhóm máu tương thích từ DB
    const compatibleDonorGroups = await databaseService.bloodGroups
      .find({ name: { $in: compatibleDonorNames as any } })
      .toArray()

    const compatibleGroupIds = compatibleDonorGroups.map((g) => g._id)

    // Tạo bộ lọc
    const finalFilter: Filter<BloodUnit> = {
      ...filter,
      status: BloodUnitStatus.Available,
      blood_group_id: { $in: compatibleGroupIds },
      blood_component_id: { $in: blood_component_ids.map((id) => new ObjectId(id)) }
    }

    const bloodUnits = await databaseService.bloodUnits
      .aggregate([
        {
          $match: finalFilter
        },
        // Join User
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'user_update'
          }
        },
        { $unwind: { path: '$user_update', preserveNullAndEmptyArrays: true } },
        // Join Blood Group
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group'
          }
        },
        {
          $unwind: {
            path: '$blood_group',
            preserveNullAndEmptyArrays: true
          }
        },
        // Join Blood Components
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component'
          }
        },
        {
          $unwind: {
            path: '$blood_component',
            preserveNullAndEmptyArrays: true
          }
        },
        // Join Health Check
        {
          $lookup: {
            from: 'health_checks',
            localField: 'donation_process_id',
            foreignField: 'donation_process_id',
            as: 'health_check'
          }
        },
        {
          $unwind: {
            path: '$health_check',
            preserveNullAndEmptyArrays: true
          }
        },
        // Final Group
        {
          $group: {
            _id: '$_id',
            // Donation Process
            donation_process_id: { $first: '$donation_process_id' },
            // Request Process
            request_process_id: { $first: '$request_process_id' },
            // Blood Group
            blood_group_id: { $first: '$blood_group_id' },
            blood_group: { $first: '$blood_group.name' },
            // Blood Component
            blood_component_id: { $first: '$blood_component_id' },
            blood_component: { $first: '$blood_component.name' },
            // Main Blood Unit
            donation_type: { $first: '$health_check.donation_type' },
            volume: { $first: '$volume' },
            expired_at: { $first: '$expired_at' },
            storage_temperature: { $first: '$storage_temperature' },
            note: { $first: '$note' },
            status: { $first: '$status' },
            // Actor
            updated_by: { $first: '$user_update.full_name' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' }
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const totalItems = await databaseService.bloodUnits.countDocuments(finalFilter)
    const totalPages = Math.ceil(totalItems / limit)

    return {
      totalItems,
      limit,
      page,
      totalPages,
      items: bloodUnits
    }
  }

  async updateStatusBloodUnits({
    id,
    payload,
    user_id
  }: {
    id: string
    payload: UpdateStatusBloodUnitsReqBody
    user_id: string
  }) {
    const bloodUnit = await databaseService.bloodUnits.findOne({ _id: new ObjectId(id) })

    if (!bloodUnit) {
      throw new ErrorWithStatus({
        message: BLOOD_MESSAGES.BLOOD_UNIT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const bloodUnitsUpdate = await databaseService.bloodUnits.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: payload.status,
          updated_by: new ObjectId(user_id)
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    // Lấy thông tin người cập nhật
    const updatedByUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    // Lấy danh sách tất cả Admin/StaffWarehouse/Staff
    const notifyUsers = await databaseService.users
      .find({ role: { $in: [UserRole.Admin, UserRole.StaffWarehouse, UserRole.Staff] } })
      .toArray()

    const now = new Date()

    // Tạo nội dung thông báo
    const title = `Trạng thái túi máu đã được cập nhật`
    const message = `Túi máu có ID ${id} đã được cập nhật thành trạng thái bị hư bởi ${updatedByUser?.full_name}.`

    // Gửi thông báo đến từng người
    await Promise.all(
      notifyUsers.map((user) =>
        databaseService.notifications.insertOne({
          receiver_id: user._id,
          blood_unit_id: bloodUnit._id,
          title,
          message,
          type: '',
          created_at: now,
          is_read: false
        })
      )
    )

    return bloodUnitsUpdate
  }
}

const bloodUnitService = new BloodUnitService()
export default bloodUnitService
