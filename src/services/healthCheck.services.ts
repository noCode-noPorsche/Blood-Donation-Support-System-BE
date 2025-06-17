import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { UpdateHealthCheckReqBody } from '~/models/requests/HealthCheck.requests'
import { ErrorWithStatus } from '~/models/Error'
import { HEALTH_CHECK_MESSAGES } from '~/constants/messages'
import { DonationProcessStatus, HealthCheckStatus } from '~/constants/enum'

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

    const result = await databaseService.healthChecks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : resultUser?.blood_group_id,
          weight: payload.weight ? payload.weight : resultUser?.weight,
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

    if (payload.status === HealthCheckStatus.Rejected) {
      await databaseService.donationProcesses.updateOne(
        { health_check_id: new ObjectId(id) },
        {
          $set: { status: DonationProcessStatus.Rejected },
          $currentDate: { updated_at: true }
        }
      )
    }

    if (!result) {
      throw new ErrorWithStatus({ message: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_NOT_FOUND, status: 400 })
    }
    return result
  }
}

const healthCheckService = new HealthCheckService()
export default healthCheckService
