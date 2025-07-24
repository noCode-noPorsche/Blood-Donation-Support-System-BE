import { config } from 'dotenv'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { DASHBOARD_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from './database.services'
config()

class DashboardService {
  async getAllDonationCount() {
    const donationCount = await databaseService.donationRegistrations.countDocuments()
    if (donationCount === null) {
      throw new ErrorWithStatus({
        message: DASHBOARD_MESSAGES.GET_ALL_DONATION_NUMBER_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return {
      number_donation: donationCount
    }
  }

  async getAllRequestCount() {
    const requestCount = await databaseService.requestRegistrations.countDocuments()
    if (requestCount === null) {
      throw new ErrorWithStatus({
        message: DASHBOARD_MESSAGES.GET_ALL_REQUEST_NUMBER_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return {
      number_request: requestCount
    }
  }

  async getAllUserCount() {
    const userCount = await databaseService.users.countDocuments()
    if (userCount === null) {
      throw new ErrorWithStatus({
        message: DASHBOARD_MESSAGES.GET_ALL_USER_NUMBER_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return {
      number_user: userCount
    }
  }

  async getBloodStockSummary() {
    const resultArray = await databaseService.bloodUnits
      .aggregate([
        {
          $match: {
            status: 'Available'
          }
        },
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'component_info'
          }
        },
        {
          $unwind: '$component_info'
        },
        {
          $group: {
            _id: '$blood_component_id',
            blood_component_name: { $first: '$component_info.name' },
            total_units: { $sum: 1 },
            total_volume: { $sum: '$volume' }
          }
        },
        {
          $project: {
            _id: 0,
            blood_component_name: 1,
            total_units: 1,
            total_volume: 1
          }
        }
      ])
      .toArray()

    if (resultArray.length === 0) {
      throw new ErrorWithStatus({
        message: DASHBOARD_MESSAGES.GET_BLOOD_STOCK_SUMMARY_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Convert array to object format
    const resultObj: Record<string, any> = {}
    for (const item of resultArray) {
      resultObj[item.blood_component_name] = item
    }

    return resultObj
  }

  async getBloodStorageSummary() {
    const resultArray = await databaseService.bloodUnits
      .aggregate([
        {
          $match: {
            status: 'Available'
          }
        },
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'component_info'
          }
        },
        {
          $unwind: '$component_info'
        },
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id', // ✅ Sửa ở đây
            foreignField: '_id',
            as: 'blood_group_info'
          }
        },
        {
          $unwind: '$blood_group_info'
        },
        {
          $group: {
            _id: {
              blood_component_id: '$blood_component_id',
              blood_group_id: '$blood_group_id'
            },
            blood_component_name: { $first: '$component_info.name' },
            blood_group_name: { $first: '$blood_group_info.name' },
            total_units: { $sum: 1 },
            total_volume: { $sum: '$volume' }
          }
        },
        {
          $project: {
            _id: 0,
            blood_component_id: '$_id.blood_component_id',
            blood_group_id: '$_id.blood_group_id',
            blood_component_name: 1,
            blood_group_name: 1,
            total_units: 1,
            total_volume: 1
          }
        },
        {
          $sort: {
            blood_component_name: 1,
            blood_group_name: 1
          }
        }
      ])
      .toArray()

    if (resultArray.length === 0) {
      throw new ErrorWithStatus({
        message: DASHBOARD_MESSAGES.GET_BLOOD_STORAGE_SUMMARY_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return resultArray
  }
}

const dashboardService = new DashboardService()
export default dashboardService
