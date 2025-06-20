import { ObjectId } from 'mongodb'
import { DonationProcessStatus, HealthCheckStatus } from '~/constants/enum'
import { HEALTH_CHECK_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { UpdateHealthCheckReqBody } from '~/models/requests/HealthCheck.requests'
import { calculateDonationVolume } from '~/utils/utils'
import databaseService from './database.services'
import { config } from 'dotenv'
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

  async updateHealthCheckById({
    user_id,
    id,
    payload
  }: {
    user_id: string
    id: string
    payload: UpdateHealthCheckReqBody
  }) {
    const resultUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

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
          temperature: payload.temperature,
          heart_rate: payload.heart_rate,
          diastolic_blood_pressure: payload.diastolic_blood_pressure,
          systolic_blood_pressure: payload.systolic_blood_pressure,
          underlying_health_condition: payload.underlying_health_condition,
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

    if (!result) {
      throw new ErrorWithStatus({ message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND, status: 400 })
    }

    if (result) {
      const userResult = await databaseService.users.findOne({
        _id: new ObjectId(user_id)
      })
      await databaseService.donationRegistrations.findOneAndUpdate(
        {
          _id: new ObjectId(result?.donation_registration_id as ObjectId)
        },
        {
          $set: {
            blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : result.blood_group_id
          }
        }
      )
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
      $currentDate: { updated_at: true },
      $set: {}
    }

    if (payload.status === HealthCheckStatus.Rejected) {
      donationUpdate.$set.status = DonationProcessStatus.Rejected
    } else {
      const volume = calculateDonationVolume(finalWeight)
      donationUpdate.$set.volume_collected = volume
      donationUpdate.$set.blood_group_id = new ObjectId(
        payload.blood_group_id || (resultUser?.blood_group_id as ObjectId)
      )
    }

    await databaseService.donationProcesses.updateOne({ health_check_id: new ObjectId(id) }, donationUpdate)

    return result
  }
}

const healthCheckService = new HealthCheckService()
export default healthCheckService
