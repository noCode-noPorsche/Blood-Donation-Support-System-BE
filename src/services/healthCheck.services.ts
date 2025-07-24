import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import {
  DonationProcessStatus,
  DonationRegistrationStatus,
  DonationType,
  HealthCheckStatus,
  RequestProcessDetailStatus,
  RequestProcessStatus,
  RequestRegistrationStatus,
  RequestType,
  UnderlyingHealthCondition
} from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { HEALTH_CHECK_MESSAGES, REQUEST_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { UpdateHealthCheckReqBody } from '~/models/requests/HealthCheck.requests'
import { calculateDonationVolume, convertTypeToComponentMap } from '~/utils/utils'
import databaseService from './database.services'
config()

class HealthCheckService {
  async getAllHealthChecks() {
    const healthCheckList = await databaseService.healthChecks
      .aggregate([
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
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        {
          $unwind: {
            path: '$user_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'user_update'
          }
        },
        { $unwind: { path: '$user_update', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            blood_group_name: '$blood_group.name',
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            // Giữ các trường gốc khác
            user_id: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            donation_registration_id: 1,
            donation_process_id: 1,
            donation_type: 1,
            request_registration_id: 1,
            request_process_id: 1,
            request_type: 1,
            weight: 1,
            temperature: 1,
            heart_rate: 1,
            diastolic_blood_pressure: 1,
            systolic_blood_pressure: 1,
            underlying_health_condition: 1,
            hemoglobin: 1,
            status: 1,
            description: 1,
            updated_by: '$user_update.full_name',
            created_at: 1,
            updated_at: 1
          }
        }
      ])
      .toArray()
    return healthCheckList
  }

  async getHealthCheckByUserId(user_id: string) {
    const healthCheck = await databaseService.healthChecks
      .aggregate([
        {
          $match: { user_id: new ObjectId(user_id) }
        },
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
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        {
          $unwind: {
            path: '$user_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'user_update'
          }
        },
        { $unwind: { path: '$user_update', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            blood_group_name: '$blood_group.name',
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            // Giữ các trường gốc khác
            user_id: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            donation_registration_id: 1,
            donation_process_id: 1,
            donation_type: 1,
            request_registration_id: 1,
            request_process_id: 1,
            request_type: 1,
            weight: 1,
            temperature: 1,
            heart_rate: 1,
            diastolic_blood_pressure: 1,
            systolic_blood_pressure: 1,
            underlying_health_condition: 1,
            hemoglobin: 1,
            status: 1,
            description: 1,
            updated_by: '$user_update.full_name',
            created_at: 1,
            updated_at: 1
          }
        }
      ])
      .toArray()
    if (!healthCheck) {
      return null
    }
    return healthCheck
  }

  async getHealthCheckById(id: string) {
    const healthCheckList = await databaseService.healthChecks
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
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
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        {
          $unwind: {
            path: '$user_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'user_update'
          }
        },
        { $unwind: { path: '$user_update', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            blood_group_name: '$blood_group.name',
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            // Giữ các trường gốc khác
            user_id: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            donation_registration_id: 1,
            donation_process_id: 1,
            donation_type: 1,
            request_registration_id: 1,
            request_process_id: 1,
            request_type: 1,
            weight: 1,
            temperature: 1,
            heart_rate: 1,
            diastolic_blood_pressure: 1,
            systolic_blood_pressure: 1,
            underlying_health_condition: 1,
            hemoglobin: 1,
            status: 1,
            description: 1,
            updated_by: '$user_update.full_name',
            created_at: 1,
            updated_at: 1
          }
        }
      ])
      .toArray()

    if (!healthCheckList || healthCheckList.length === 0) {
      throw new ErrorWithStatus({
        message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return healthCheckList[0]
  }

  async updateHealthCheckById({
    user_id,
    id,
    payload
  }: {
    user_id: string
    id: string
    payload: UpdateHealthCheckReqBody
  }) {
    const resultHealthCheck = await databaseService.healthChecks.findOne({ _id: new ObjectId(id) })

    if (!resultHealthCheck) {
      throw new ErrorWithStatus({
        message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Chặn cập nhật nếu donation_registration chưa checked-in
    if (resultHealthCheck.donation_registration_id) {
      const donationRegistration = await databaseService.donationRegistrations.findOne({
        _id: new ObjectId(resultHealthCheck.donation_registration_id)
      })

      if (donationRegistration?.status !== DonationRegistrationStatus.CheckedIn) {
        throw new ErrorWithStatus({
          message: HEALTH_CHECK_MESSAGES.UNABLE_TO_UPDATE_HEALTH_CHECK_NOT_CHECKED_IN,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Chặn cập nhật nếu request_registration vẫn còn pending
    if (resultHealthCheck.request_registration_id) {
      const requestRegistration = await databaseService.requestRegistrations.findOne({
        _id: new ObjectId(resultHealthCheck.request_registration_id)
      })

      if (requestRegistration?.status === RequestRegistrationStatus.Pending) {
        throw new ErrorWithStatus({
          message: HEALTH_CHECK_MESSAGES.UNABLE_TO_UPDATE_HEALTH_CHECK_PENDING_REQUEST,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    const resultUser = await databaseService.users.findOne({ _id: new ObjectId(resultHealthCheck?.user_id) })

    if (!resultUser) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }

    const finalWeight = payload.weight ?? resultUser.weight

    // Kiểm tra tình trạng bệnh nền có bị loại trừ không
    const disqualifyingConditions: UnderlyingHealthCondition[] = [
      UnderlyingHealthCondition.Diabetes,
      UnderlyingHealthCondition.Hypertension,
      UnderlyingHealthCondition.HeartDisease,
      UnderlyingHealthCondition.Cancer,
      UnderlyingHealthCondition.Thalassemia,
      UnderlyingHealthCondition.Hemophilia,
      UnderlyingHealthCondition.Epilepsy,
      UnderlyingHealthCondition.ActivePulmonaryTuberculosis,
      UnderlyingHealthCondition.SevereAnemia,
      UnderlyingHealthCondition.SevereNeurologicalDisorder,
      UnderlyingHealthCondition.HIV,
      UnderlyingHealthCondition.HepatitisBorC
    ]
    const conditions = Array.isArray(payload.underlying_health_condition)
      ? payload.underlying_health_condition
      : [payload.underlying_health_condition]

    const hasDisqualifyingCondition = conditions.some((cond) =>
      disqualifyingConditions.includes(cond as UnderlyingHealthCondition)
    )

    // Nếu bị bệnh không đủ điều kiện hoặc dưới 42kg, thì auto reject
    const isDonationProcess = !!resultHealthCheck.donation_process_id || !!resultHealthCheck.donation_registration_id
    const shouldReject = (finalWeight < 42 || hasDisqualifyingCondition) && isDonationProcess
    let rejectionReason = ''
    if (shouldReject) {
      rejectionReason =
        finalWeight < 42
          ? HEALTH_CHECK_MESSAGES.THE_MINIUM_WEIGHT_REQUIRED_TO_DONATION_BLOOD_IS_42KG
          : HEALTH_CHECK_MESSAGES.UNABLE_TO_DONATE_DUE_TO_HEALTH_CONDITION

      // Tự động set status về Rejected và description luôn
      payload.status = HealthCheckStatus.Rejected
      payload.description = rejectionReason
    }

    // // Kiểm tra trọng lượng có hợp lệ không và chỉ từ chối nếu là quy trình hiến máu
    // let isRejectedDueToWeight = false
    // const isDonationProcess = !!resultHealthCheck.donation_process_id || !!resultHealthCheck.donation_registration_id

    // if (finalWeight < 42 && isDonationProcess) {
    //   payload.status = HealthCheckStatus.Rejected
    //   isRejectedDueToWeight = true
    // }

    //Kiểm tra xem có donation_type hoặc request_type không và chuyển đổi sang blood_component_ids
    let bloodComponentIdsFromType: ObjectId[] = []
    if (payload.donation_type) {
      const componentNames = convertTypeToComponentMap[payload.donation_type]
      const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()
      bloodComponentIdsFromType = componentDocs.map((comp) => comp._id)
    }

    if (payload.request_type) {
      const componentNames = convertTypeToComponentMap[payload.request_type]
      const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()
      bloodComponentIdsFromType = componentDocs.map((comp) => comp._id)
    }

    // Cập nhật health check
    const resultHealthCheckUpdate = await databaseService.healthChecks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          blood_group_id: payload.blood_group_id
            ? new ObjectId(payload.blood_group_id)
            : new ObjectId(resultUser?.blood_group_id as ObjectId),
          blood_component_ids:
            bloodComponentIdsFromType.length > 0
              ? bloodComponentIdsFromType
              : resultHealthCheck.blood_component_ids || [],
          donation_type: payload.donation_type,
          request_type: payload.request_type,
          weight: finalWeight,
          temperature: payload.temperature,
          heart_rate: payload.heart_rate,
          diastolic_blood_pressure: payload.diastolic_blood_pressure,
          systolic_blood_pressure: payload.systolic_blood_pressure,
          underlying_health_condition: payload.underlying_health_condition,
          hemoglobin: payload.hemoglobin,
          status: payload.status,
          description: payload.description,
          updated_by: new ObjectId(user_id)
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    if (resultHealthCheckUpdate) {
      const userResult = await databaseService.users.findOne({
        _id: new ObjectId(resultHealthCheckUpdate.user_id)
      })

      if (resultHealthCheckUpdate.donation_registration_id) {
        // HealthCheck này thuộc quy trình hiến máu - Donation Registration
        await databaseService.donationRegistrations.findOneAndUpdate(
          {
            _id: new ObjectId(resultHealthCheckUpdate.donation_registration_id)
          },
          {
            $set: {
              blood_group_id: payload.blood_group_id
                ? new ObjectId(payload.blood_group_id)
                : resultHealthCheckUpdate.blood_group_id,
              donation_type: payload.donation_type,
              blood_component_ids:
                bloodComponentIdsFromType.length > 0
                  ? bloodComponentIdsFromType
                  : resultHealthCheck.blood_component_ids || []
            }
          }
        )
      } else if (resultHealthCheckUpdate.request_registration_id) {
        // HealthCheck này thuộc quy trình nhận máu - Request Registration
        await databaseService.requestRegistrations.findOneAndUpdate(
          {
            _id: new ObjectId(resultHealthCheckUpdate.request_registration_id)
          },
          {
            $set: {
              blood_group_id: payload.blood_group_id
                ? new ObjectId(payload.blood_group_id)
                : resultHealthCheckUpdate.blood_group_id,
              request_type: payload.request_type,
              blood_component_ids:
                bloodComponentIdsFromType.length > 0
                  ? bloodComponentIdsFromType
                  : resultHealthCheck.blood_component_ids || []
            }
          }
        )
      }

      // Luôn cập nhật user nếu tìm được
      if (userResult) {
        await databaseService.users.findOneAndUpdate(
          { _id: new ObjectId(userResult._id) },
          {
            $set: {
              blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : userResult.blood_group_id,
              weight: finalWeight
            },
            $currentDate: { updated_at: true }
          }
        )
      }
    }

    // const donationUpdate: {
    //   $set: Partial<{
    //     status: DonationProcessStatus
    //     volume_collected: number
    //     blood_group_id: ObjectId
    //   }>
    //   $currentDate: {
    //     updated_at: true
    //   }
    // } = {
    //   $currentDate: { updated_at: true },
    //   $set: {}
    // }

    // if (payload.status === HealthCheckStatus.Rejected) {
    //   donationUpdate.$set.status = DonationProcessStatus.Rejected
    // } else {
    //   const volume = calculateDonationVolume(finalWeight)
    //   donationUpdate.$set.volume_collected = volume
    //   donationUpdate.$set.blood_group_id = new ObjectId(
    //     payload.blood_group_id || (resultUser?.blood_group_id as ObjectId)
    //   )
    // }

    // await databaseService.donationProcesses.updateOne({ health_check_id: new ObjectId(id) }, donationUpdate)

    if (resultHealthCheckUpdate?.donation_process_id) {
      // HealthCheck này thuộc quy trình hiến máu - Donation Process
      const donationType = resultHealthCheckUpdate.donation_type || payload.donation_type

      const donationUpdate: {
        $set: Partial<{
          status: DonationProcessStatus
          volume_collected: number
          blood_group_id: ObjectId
        }>
        $currentDate: {
          updated_at: true
        }
      } = {
        $set: {
          status:
            payload.status === HealthCheckStatus.Rejected
              ? DonationProcessStatus.Rejected
              : DonationProcessStatus.Pending,
          volume_collected: 0,
          blood_group_id: new ObjectId(payload.blood_group_id || (resultUser?.blood_group_id as ObjectId))
        },
        $currentDate: {
          updated_at: true
        }
      }

      // Chỉ tính volume nếu là hiến máu toàn phần
      if (donationType === DonationType.WholeBlood) {
        donationUpdate.$set.volume_collected = calculateDonationVolume(finalWeight)
      }

      await databaseService.donationProcesses.updateOne({ health_check_id: new ObjectId(id) }, donationUpdate)
    } else if (resultHealthCheckUpdate?.request_process_id) {
      // HealthCheck này thuộc quy trình nhận máu - Request Process
      const requestUpdate: {
        $set: Partial<{
          status: RequestProcessStatus
          blood_group_id: ObjectId
          blood_component_ids: ObjectId[]
          request_type: RequestType
        }>
        $currentDate: {
          updated_at: true
        }
      } = {
        $set: {
          status:
            payload.status === HealthCheckStatus.Rejected
              ? RequestProcessStatus.Rejected
              : RequestProcessStatus.Pending,
          blood_group_id: new ObjectId(payload.blood_group_id || (resultUser?.blood_group_id as ObjectId)),
          blood_component_ids:
            bloodComponentIdsFromType.length > 0
              ? bloodComponentIdsFromType
              : resultHealthCheck.blood_component_ids || [],
          request_type: payload.request_type
        },
        $currentDate: {
          updated_at: true
        }
      }

      await databaseService.requestProcesses.updateOne({ health_check_id: new ObjectId(id) }, requestUpdate)

      // Cập nhật request_process_detail nếu có request_process_id
      if (resultHealthCheckUpdate.request_process_id && payload.request_type && bloodComponentIdsFromType.length > 0) {
        const requestProcessId = new ObjectId(resultHealthCheckUpdate.request_process_id)

        // Xoá các request_process_detail cũ
        await databaseService.requestProcessDetails.deleteMany({ request_process_id: requestProcessId })

        const defaultVolume = 0 // hoặc payload.volume nếu bạn có

        const detailsToInsert = bloodComponentIdsFromType.map((componentId) => ({
          request_process_id: requestProcessId,
          blood_component_id: componentId,
          blood_group_id: new ObjectId(payload.blood_group_id || (resultUser?.blood_group_id as ObjectId)),
          volume_required: defaultVolume,
          status: RequestProcessDetailStatus.Pending,
          updated_by: new ObjectId(user_id),
          created_at: new Date(),
          updated_at: new Date()
        }))
        await databaseService.requestProcessDetails.insertMany(detailsToInsert)
      }
    }

    return resultHealthCheckUpdate
  }
}

const healthCheckService = new HealthCheckService()
export default healthCheckService

//Create Request Process Blood
// if (payload.status === HealthCheckStatus.Approved && result?.request_registration_id) {
//   const requestProcess = await databaseService.requestProcesses.findOne({
//     health_check_id: result._id
//   })

//   if (!requestProcess) {
//     throw new ErrorWithStatus({
//       message: REQUEST_MESSAGES.REQUEST_PROCESS_NOT_FOUND,
//       status: HTTP_STATUS.NOT_FOUND
//     })
//   }

//   await databaseService.requestProcessBloods.deleteMany({
//     request_process_id: requestProcess._id
//   })

//   // 1. Lấy tất cả túi máu còn dùng được
//   const allAvailableUnits = await databaseService.bloodUnits
//     .find({
//       status: BloodUnitStatus.Available,
//       volume: { $gt: 0 },
//       expired_at: { $gt: new Date() }
//     })
//     .toArray()

//   // 2. Lọc nhóm máu tương thích
//   const compatibleUnits = []

//   for (const unit of allAvailableUnits) {
//     const isCompatible = await isCompatibleDonor(
//       requestProcess.blood_group_id.toString(),
//       unit.blood_group_id.toString()
//     )

//     if (isCompatible) {
//       compatibleUnits.push(unit)
//     }
//   }

//   // 3. Với từng thành phần cần thiết, lọc túi máu tương ứng
//   for (const componentId of requestProcess.blood_component_ids || []) {
//     const matchingUnits = compatibleUnits.filter(
//       (unit) => unit.blood_component_id.toString() === componentId.toString()
//     )

//     for (const unit of matchingUnits) {
//       const newMapping: RequestProcessBlood = {
//         request_process_id: requestProcess._id,
//         blood_unit_id: unit._id,
//         blood_component_id: unit.blood_component_id,
//         blood_group_id: unit.blood_group_id,
//         volume: unit.volume ?? 0,
//         status: RequestProcessBloodStatus.Pending,
//         created_at: new Date(),
//         updated_at: new Date(),
//         updated_by: new ObjectId(user_id)
//       }

//       await databaseService.requestProcessBloods.insertOne(newMapping)
//     }
//   }
// }
