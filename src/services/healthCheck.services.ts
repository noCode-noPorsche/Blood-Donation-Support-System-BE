import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { DonationProcessStatus, HealthCheckStatus, RequestProcessStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { HEALTH_CHECK_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { UpdateHealthCheckReqBody } from '~/models/requests/HealthCheck.requests'
import { calculateDonationVolume } from '~/utils/utils'
import databaseService from './database.services'
config()

class HealthCheckService {
  async getAllHealthChecks() {
    const listHealthChecks = await databaseService.healthChecks
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
          $project: {
            'blood_group._id': 0,
            'blood_group.created_at': 0,
            'blood_group.updated_at': 0
          }
        }
      ])
      .toArray()
    return listHealthChecks
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
          $project: {
            'blood_group._id': 0,
            'blood_group.created_at': 0,
            'blood_group.updated_at': 0
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
    const healthCheck = await databaseService.healthChecks.findOne({ _id: new ObjectId(id) })
    if (!healthCheck) {
      throw new ErrorWithStatus({
        message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return healthCheck
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
      throw new ErrorWithStatus({ message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND, status: 400 })
    }

    const resultUser = await databaseService.users.findOne({ _id: new ObjectId(resultHealthCheck?.user_id) })

    if (!resultUser) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: 404 })
    }

    const finalWeight = payload.weight ?? resultUser.weight

    let isRejectedDueToWeight = false
    if (finalWeight < 42) {
      payload.status = HealthCheckStatus.Rejected
      isRejectedDueToWeight = true
    }

    const result = await databaseService.healthChecks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          blood_group_id: payload.blood_group_id
            ? new ObjectId(payload.blood_group_id)
            : new ObjectId(resultUser?.blood_group_id as ObjectId),
          weight: finalWeight,
          blood_component_ids: Array.isArray(payload.blood_component_ids)
            ? payload.blood_component_ids.map((id) => new ObjectId(id))
            : [],
          temperature: payload.temperature,
          heart_rate: payload.heart_rate,
          diastolic_blood_pressure: payload.diastolic_blood_pressure,
          systolic_blood_pressure: payload.systolic_blood_pressure,
          underlying_health_condition: payload.underlying_health_condition,
          updated_by: new ObjectId(user_id),
          hemoglobin: payload.hemoglobin,
          status: payload.status,
          description: payload.description
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    if (result) {
      const userResult = await databaseService.users.findOne({
        _id: new ObjectId(result.user_id)
      })

      if (result.donation_registration_id) {
        // HealthCheck này thuộc quy trình hiến máu
        await databaseService.donationRegistrations.findOneAndUpdate(
          {
            _id: new ObjectId(result.donation_registration_id)
          },
          {
            $set: {
              blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : result.blood_group_id
            }
          }
        )
      } else if (result.request_registration_id) {
        // HealthCheck này thuộc quy trình nhận máu
        await databaseService.requestRegistrations.findOneAndUpdate(
          {
            _id: new ObjectId(result.request_registration_id)
          },
          {
            $set: {
              blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : result.blood_group_id
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

    if (result?.donation_registration_id) {
      // health check for donation registration
      const volume = calculateDonationVolume(finalWeight)

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
              : DonationProcessStatus.Approved,
          volume_collected: volume,
          blood_group_id: new ObjectId(payload.blood_group_id || (resultUser?.blood_group_id as ObjectId))
        },
        $currentDate: {
          updated_at: true
        }
      }
      await databaseService.donationProcesses.updateOne({ health_check_id: new ObjectId(id) }, donationUpdate)
    } else if (result?.request_registration_id) {
      // health check for request registration
      const requestUpdate: {
        $set: Partial<{
          status: RequestProcessStatus
          blood_group_id: ObjectId
          blood_component_ids: ObjectId[]
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
          blood_component_ids: Array.isArray(payload.blood_component_ids)
            ? payload.blood_component_ids.map((id) => new ObjectId(id))
            : []
        },
        $currentDate: {
          updated_at: true
        }
      }

      await databaseService.requestProcesses.updateOne({ health_check_id: new ObjectId(id) }, requestUpdate)
    }

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
    return result
  }
}

const healthCheckService = new HealthCheckService()
export default healthCheckService
