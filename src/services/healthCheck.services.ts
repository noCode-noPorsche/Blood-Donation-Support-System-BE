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
import { HEALTH_CHECK_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { UpdateHealthCheckReqBody } from '~/models/requests/HealthCheck.requests'
import { calculateDonationVolume, convertTypeToComponentMap } from '~/utils/utils'
import databaseService from './database.services'
config()

class HealthCheckService {
  // Lấy danh sách Health Check
  async getAllHealthChecks({ page, limit }: { page: number; limit: number }) {
    const healthCheck = await databaseService.healthChecks
      .aggregate([
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
        // Join Blood Component
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_ids',
            foreignField: '_id',
            as: 'blood_components_docs'
          }
        },
        // Join User
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
        // Final Projection
        {
          $group: {
            _id: '$_id',
            // User
            user_id: { $first: '$user_id' },
            citizen_id_number: { $first: '$user_info.citizen_id_number' },
            full_name: { $first: '$user_info.full_name' },
            phone: { $first: '$user_info.phone' },
            // Blood
            blood_group: { $first: '$blood_group.name' },
            blood_components: { $first: '$blood_components_docs.name' },
            // Donation Registration
            donation_registration_id: { $first: '$donation_registration_id' },
            donation_process_id: { $first: '$donation_process_id' },
            donation_type: { $first: '$donation_type' },
            // Request Registration
            request_registration_id: { $first: '$request_registration_id' },
            request_process_id: { $first: '$request_process_id' },
            request_type: { $first: '$request_type' },
            // Main Health Check
            weight: { $first: '$weight' },
            temperature: { $first: '$temperature' },
            heart_rate: { $first: '$heart_rate' },
            diastolic_blood_pressure: { $first: '$diastolic_blood_pressure' },
            systolic_blood_pressure: { $first: '$systolic_blood_pressure' },
            underlying_health_condition: { $first: '$underlying_health_condition' },
            hemoglobin: { $first: '$hemoglobin' },
            description: { $first: '$description' },
            // Actor
            status: { $first: '$status' },
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

    const totalItems = await databaseService.healthChecks.countDocuments()
    const totalPages = Math.ceil(totalItems / limit)

    return {
      totalItems,
      limit,
      page,
      totalPages,
      items: healthCheck
    }
  }

  async getHealthCheckByUserId({ page, limit, user_id }: { page: number; limit: number; user_id: string }) {
    const healthCheck = await databaseService.healthChecks
      .aggregate([
        {
          $match: { user_id: new ObjectId(user_id) }
        },
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
        // Join Blood Component
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_ids',
            foreignField: '_id',
            as: 'blood_components_docs'
          }
        },
        // Join User
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
        // Final Projection
        {
          $group: {
            _id: '$_id',
            // User
            user_id: { $first: '$user_id' },
            citizen_id_number: { $first: '$user_info.citizen_id_number' },
            full_name: { $first: '$user_info.full_name' },
            phone: { $first: '$user_info.phone' },
            // Blood
            blood_group: { $first: '$blood_group.name' },
            blood_components: { $first: '$blood_components_docs.name' },
            // Donation Registration
            donation_registration_id: { $first: '$donation_registration_id' },
            donation_process_id: { $first: '$donation_process_id' },
            donation_type: { $first: '$donation_type' },
            // Request Registration
            request_registration_id: { $first: '$request_registration_id' },
            request_process_id: { $first: '$request_process_id' },
            request_type: { $first: '$request_type' },
            // Main Health Check
            weight: { $first: '$weight' },
            temperature: { $first: '$temperature' },
            heart_rate: { $first: '$heart_rate' },
            diastolic_blood_pressure: { $first: '$diastolic_blood_pressure' },
            systolic_blood_pressure: { $first: '$systolic_blood_pressure' },
            underlying_health_condition: { $first: '$underlying_health_condition' },
            hemoglobin: { $first: '$hemoglobin' },
            description: { $first: '$description' },
            // Actor
            status: { $first: '$status' },
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

    const totalItems = await databaseService.healthChecks.countDocuments({ user_id: new ObjectId(user_id) })
    const totalPages = Math.ceil(totalItems / limit)

    return {
      totalItems,
      limit,
      page,
      totalPages,
      items: healthCheck
    }
  }

  async getHealthCheckById(id: string) {
    const healthCheck = await databaseService.healthChecks
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
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
        // Join Blood Component
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_ids',
            foreignField: '_id',
            as: 'blood_components_docs'
          }
        },
        // Join User
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
        // Final Projection
        {
          $group: {
            _id: '$_id',
            // User
            user_id: { $first: '$user_id' },
            citizen_id_number: { $first: '$user_info.citizen_id_number' },
            full_name: { $first: '$user_info.full_name' },
            phone: { $first: '$user_info.phone' },
            // Blood
            blood_group: { $first: '$blood_group.name' },
            blood_components: { $first: '$blood_components_docs.name' },
            // Donation Registration
            donation_registration_id: { $first: '$donation_registration_id' },
            donation_process_id: { $first: '$donation_process_id' },
            donation_type: { $first: '$donation_type' },
            // Request Registration
            request_registration_id: { $first: '$request_registration_id' },
            request_process_id: { $first: '$request_process_id' },
            request_type: { $first: '$request_type' },
            // Main Health Check
            weight: { $first: '$weight' },
            temperature: { $first: '$temperature' },
            heart_rate: { $first: '$heart_rate' },
            diastolic_blood_pressure: { $first: '$diastolic_blood_pressure' },
            systolic_blood_pressure: { $first: '$systolic_blood_pressure' },
            underlying_health_condition: { $first: '$underlying_health_condition' },
            hemoglobin: { $first: '$hemoglobin' },
            description: { $first: '$description' },
            // Actor
            status: { $first: '$status' },
            updated_by: { $first: '$user_update.full_name' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' }
          }
        }
      ])
      .toArray()

    if (!healthCheck || healthCheck.length === 0) {
      throw new ErrorWithStatus({
        message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return healthCheck[0]
  }

  // Cập nhật Health Check
  async updateHealthCheckById({
    user_id,
    id,
    payload
  }: {
    user_id: string
    id: string
    payload: UpdateHealthCheckReqBody
  }) {
    const healthCheck = await databaseService.healthChecks.findOne({ _id: new ObjectId(id) })
    if (!healthCheck) {
      throw new ErrorWithStatus({
        message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Nếu status Donation Registration khác "Checked In" thì ko được cập nhật
    if (healthCheck.donation_registration_id) {
      const donationRegistration = await databaseService.donationRegistrations.findOne({
        _id: new ObjectId(healthCheck.donation_registration_id)
      })

      if (donationRegistration?.status !== DonationRegistrationStatus.CheckedIn) {
        throw new ErrorWithStatus({
          message: HEALTH_CHECK_MESSAGES.UNABLE_TO_UPDATE_HEALTH_CHECK_NOT_CHECKED_IN_OR_REJECTED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Nếu status Health Check là "Rejected" hoặc status Donation Process là "Rejected" or "Approved" thì ko được cập nhật
    if (healthCheck.donation_process_id) {
      const donationProcess = await databaseService.donationProcesses.findOne({
        _id: new ObjectId(healthCheck.donation_process_id)
      })

      if (
        donationProcess?.status !== DonationProcessStatus.Pending ||
        healthCheck.status === HealthCheckStatus.Rejected
      ) {
        throw new ErrorWithStatus({
          message:
            HEALTH_CHECK_MESSAGES.UNABLE_TO_UPDATE_HEALTH_CHECK_REJECTED_OR_DONATION_PROCESS_APPROVED_OR_REJECTED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    const user = await databaseService.users.findOne({ _id: new ObjectId(healthCheck?.user_id) })
    if (!user) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }

    const updateHealthCheckFields: Record<string, any> = {
      blood_group_id: payload.blood_group_id,
      donation_type: payload.donation_type,
      request_type: payload.request_type,
      weight: payload.weight,
      heart_rate: payload.heart_rate,
      temperature: payload.temperature,
      diastolic_blood_pressure: payload.diastolic_blood_pressure,
      systolic_blood_pressure: payload.systolic_blood_pressure,
      hemoglobin: payload.hemoglobin,
      description: payload.description,
      underlying_health_condition: payload.underlying_health_condition,
      status: payload.status
    }

    // Nếu có blood_group_id format ObjectId
    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const bloodGroupId = isValidBloodGroupId ? new ObjectId(payload.blood_group_id) : healthCheck.blood_group_id
    updateHealthCheckFields.blood_group_id = bloodGroupId

    // Nếu có weight gửi về ko thì lấy từ user
    const finalWeight = payload.weight ? payload.weight : user.weight
    updateHealthCheckFields.weight = finalWeight

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

    const underlyingHealthCondition = Array.isArray(payload.underlying_health_condition)
      ? payload.underlying_health_condition
      : [payload.underlying_health_condition]
    updateHealthCheckFields.underlying_health_condition = underlyingHealthCondition

    const hasDisqualifyingCondition = underlyingHealthCondition.some((unHeCo) =>
      disqualifyingConditions.includes(unHeCo as UnderlyingHealthCondition)
    )

    // Nếu có ít nhất 1 bệnh thì không đủ điều kiện hoặc dưới 42k và tự cập nhật status Rejected
    const isDonationProcess = !!healthCheck.donation_process_id || !!healthCheck.donation_registration_id
    const shouldReject = (finalWeight < 42 || hasDisqualifyingCondition) && isDonationProcess
    let rejectionReason = ''
    if (shouldReject) {
      rejectionReason =
        finalWeight < 42
          ? HEALTH_CHECK_MESSAGES.THE_MINIUM_WEIGHT_REQUIRED_TO_DONATION_BLOOD_IS_42KG
          : HEALTH_CHECK_MESSAGES.UNABLE_TO_DONATE_DUE_TO_HEALTH_CONDITION

      // Tự động set status về "Rejected" và description
      updateHealthCheckFields.status = HealthCheckStatus.Rejected
      updateHealthCheckFields.description = rejectionReason
    }

    // Kiểm tra xem có donation_type hoặc request_type ko và chuyển đổi sang blood_component_ids
    // let bloodComponentIdsFromType: ObjectId[] = []
    if (payload.donation_type) {
      const componentNames = convertTypeToComponentMap[payload.donation_type]
      const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()
      const bloodComponentIdsFromType = componentDocs.map((comp) => comp._id)

      updateHealthCheckFields.blood_component_ids = bloodComponentIdsFromType
      updateHealthCheckFields.donation_type = payload.donation_type
    }

    if (payload.request_type) {
      const componentNames = convertTypeToComponentMap[payload.request_type]
      const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()
      const bloodComponentIdsFromType = componentDocs.map((comp) => comp._id)

      updateHealthCheckFields.blood_component_ids = bloodComponentIdsFromType
      updateHealthCheckFields.request_type = payload.request_type
    }

    // Cập nhật Health Check
    const resultHealthCheckUpdate = await databaseService.healthChecks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateHealthCheckFields,
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
      if (resultHealthCheckUpdate.donation_registration_id) {
        // Cập nhật Donation Registration thuộc quy trình hiến máu
        await databaseService.donationRegistrations.findOneAndUpdate(
          {
            _id: new ObjectId(resultHealthCheckUpdate.donation_registration_id)
          },
          {
            $set: {
              blood_group_id: updateHealthCheckFields.blood_group_id,
              donation_type: updateHealthCheckFields.donation_type,
              blood_component_ids:
                updateHealthCheckFields.blood_component_ids.length > 0
                  ? updateHealthCheckFields.blood_component_ids
                  : healthCheck.blood_component_ids || []
            }
          }
        )
      } else if (resultHealthCheckUpdate.request_registration_id) {
        // Cập nhật Request Registration thuộc quy trình nhận máu
        await databaseService.requestRegistrations.findOneAndUpdate(
          {
            _id: new ObjectId(resultHealthCheckUpdate.request_registration_id)
          },
          {
            $set: {
              blood_group_id: updateHealthCheckFields.blood_group_id,
              request_type: updateHealthCheckFields.request_type,
              blood_component_ids:
                updateHealthCheckFields.blood_component_ids.length > 0
                  ? updateHealthCheckFields.blood_component_ids
                  : healthCheck.blood_component_ids || []
            }
          }
        )
      }
      // Luôn cập nhật user nếu tìm được
      await databaseService.users.findOneAndUpdate(
        { _id: new ObjectId(user._id) },
        {
          $set: {
            blood_group_id: updateHealthCheckFields.blood_group_id,
            weight: updateHealthCheckFields.weight
          },
          $currentDate: { updated_at: true }
        }
      )
    }

    if (resultHealthCheckUpdate?.donation_process_id) {
      // HealthCheck này thuộc quy trình hiến máu - Donation Process
      const donationType = resultHealthCheckUpdate.donation_type || updateHealthCheckFields.donation_type

      const donationProcessUpdate: {
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
            updateHealthCheckFields.status === HealthCheckStatus.Rejected
              ? DonationProcessStatus.Rejected
              : DonationProcessStatus.Pending,
          volume_collected: 0,
          blood_group_id: updateHealthCheckFields.blood_group_id
        },
        $currentDate: {
          updated_at: true
        }
      }

      // Chỉ tính volume nếu là hiến máu toàn phần - Whole Blood
      if (donationType === DonationType.WholeBlood) {
        donationProcessUpdate.$set.volume_collected = calculateDonationVolume(finalWeight)
      }
      // Cập nhật Donation Process
      await databaseService.donationProcesses.updateOne({ health_check_id: new ObjectId(id) }, donationProcessUpdate)
    } else if (resultHealthCheckUpdate?.request_process_id) {
      // Health Check này thuộc quy trình nhận máu - Request Process
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
            updateHealthCheckFields.status === HealthCheckStatus.Rejected
              ? RequestProcessStatus.Rejected
              : RequestProcessStatus.Pending,
          blood_group_id: updateHealthCheckFields.blood_group_id,
          blood_component_ids:
            updateHealthCheckFields.blood_component_ids.length > 0
              ? updateHealthCheckFields.blood_component_ids
              : healthCheck.blood_component_ids || [],
          request_type: updateHealthCheckFields.request_type
        },
        $currentDate: {
          updated_at: true
        }
      }
      // Cập nhật Request Process
      await databaseService.requestProcesses.updateOne({ health_check_id: new ObjectId(id) }, requestUpdate)

      // Cập nhật request_process_detail nếu có request_process_id
      if (
        resultHealthCheckUpdate.request_process_id &&
        updateHealthCheckFields.request_type &&
        updateHealthCheckFields.blood_component_ids.length > 0
      ) {
        const requestProcessId = new ObjectId(resultHealthCheckUpdate.request_process_id)

        // Xoá các request_process_detail cũ
        await databaseService.requestProcessDetails.deleteMany({ request_process_id: requestProcessId })

        const defaultVolume = 0

        const detailsToInsert = (updateHealthCheckFields.blood_component_ids as ObjectId[]).map((componentId) => ({
          request_process_id: requestProcessId,
          blood_component_id: componentId,
          blood_group_id: new ObjectId(payload.blood_group_id || (user?.blood_group_id as ObjectId)),
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
