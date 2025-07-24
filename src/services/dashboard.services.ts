import { config } from 'dotenv'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { DASHBOARD_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from './database.services'
import { BloodUnitStatus, DonationRegistrationStatus, UserRole } from '~/constants/enum'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
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
            localField: 'blood_group_id',
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

  async getDashboardAdminOverview() {
    const now = new Date()
    const today = new Date(now.toISOString().split('T')[0])

    // USERS
    const totalUsers = await databaseService.users.countDocuments({ role: UserRole.Customer })
    const usersByGender = await databaseService.users
      .aggregate([
        { $match: { role: UserRole.Customer } }, // lọc role customer
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ])
      .toArray()
    const usersByAgeGroup = await databaseService.users
      .aggregate([
        {
          $match: {
            role: UserRole.Customer,
            date_of_birth: { $exists: true }
          }
        },
        {
          $addFields: {
            birthYear: { $year: '$date_of_birth' },
            currentYear: { $year: now }
          }
        },
        {
          $addFields: {
            age: { $subtract: ['$currentYear', '$birthYear'] }
          }
        },
        {
          $bucket: {
            groupBy: '$age',
            boundaries: [0, 18, 26, 36, 51, 200],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ])
      .toArray()
    const recentUsers = await databaseService.users
      .find({ role: UserRole.Customer })
      .limit(20)
      .sort({ created_at: -1 })
      .project({
        _id: 0,
        id: '$_id',
        name: 1,
        email: 1,
        full_name: 1,
        phone: 1,
        citizen_id_number: 1,
        register_date: '$created_at'
      })
      .toArray()

    // STAFF
    const staffRoles = Object.values(UserRole).filter((role) => role !== UserRole.Admin && role !== UserRole.Customer)
    const totalStaff = await databaseService.users.countDocuments({
      role: { $in: staffRoles }
    })
    const staffByRole = await databaseService.users
      .aggregate([{ $match: { role: { $in: staffRoles } } }, { $group: { _id: '$role', count: { $sum: 1 } } }])
      .toArray()
    const byRole = Object.fromEntries(
      staffRoles.map((role) => {
        const found = staffByRole.find((r) => r._id === role)
        return [role, found?.count || 0]
      })
    )

    // DONATIONS
    const totalDonations = await databaseService.donationRegistrations.countDocuments()
    const donationsByStatus = await databaseService.donationRegistrations
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .toArray()
    const recentDonationForms = await databaseService.donationRegistrations
      .aggregate([
        { $sort: { created_at: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'bloodGroup'
          }
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            donor_name: { $arrayElemAt: ['$user.full_name', 0] },
            blood_group_name: { $arrayElemAt: ['$bloodGroup.name', 0] },
            donation_type: '$donation_type',
            register_date: '$created_at',
            status: 1
          }
        }
      ])
      .toArray()

    const checkedInCount =
      donationsByStatus.find((item) => item._id === DonationRegistrationStatus.CheckedIn)?.count || 0
    const completedRate = totalDonations > 0 ? ((checkedInCount / totalDonations) * 100).toFixed(0) + '%' : '0%'

    // REQUESTS
    const totalRequests = await databaseService.requestRegistrations.countDocuments()
    const requestByStatus = await databaseService.requestRegistrations
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .toArray()
    const recentRequestForms = await databaseService.requestRegistrations
      .aggregate([
        { $sort: { created_at: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'bloodGroup'
          }
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            receiver_name: { $arrayElemAt: ['$user.full_name', 0] },
            blood_group_name: { $arrayElemAt: ['$bloodGroup.name', 0] },
            request_type: '$request_type',
            register_date: '$created_at',
            status: 1
          }
        }
      ])
      .toArray()

    // INVENTORY
    const totalUnits = await databaseService.bloodUnits.countDocuments({
      status: BloodUnitStatus.Available
    })
    // ----------- Nhóm máu -----------
    const bloodGroups = await databaseService.bloodGroups.find().toArray()
    const defaultGroupCounts = Object.fromEntries(bloodGroups.map((g) => [g.name, 0]))

    const groupCounts = await databaseService.bloodUnits
      .aggregate([
        {
          $match: { status: BloodUnitStatus.Available }
        },
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'group'
          }
        },
        {
          $group: {
            _id: { $arrayElemAt: ['$group.name', 0] },
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()
    for (const g of groupCounts) {
      defaultGroupCounts[g._id] = g.count
    }
    // ----------- Thành phần máu -----------
    const components = await databaseService.bloodComponents.find().toArray()
    const defaultComponentCounts = Object.fromEntries(components.map((c) => [c.name, 0]))

    const componentCounts = await databaseService.bloodUnits
      .aggregate([
        {
          $match: { status: BloodUnitStatus.Available }
        },
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'component'
          }
        },
        {
          $group: {
            _id: { $arrayElemAt: ['$component.name', 0] },
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    for (const c of componentCounts) {
      defaultComponentCounts[c._id] = c.count
    }
    // Các túi máu sắp hết hạn
    const expiringSoon = await databaseService.bloodUnits
      .aggregate([
        {
          $match: {
            status: BloodUnitStatus.Available,
            expired_at: { $gte: now, $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // hết hạn trong 7 ngày
          }
        },
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'group'
          }
        },
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'component'
          }
        },
        {
          $project: {
            _id: 0,
            blood_bag_id: '$_id',
            blood_group_name: { $arrayElemAt: ['$group.name', 0] },
            blood_component_name: { $arrayElemAt: ['$component.name', 0] },
            expired_date: '$expired_at',
            volume: '$volume',
            days_left: {
              $floor: {
                $divide: [{ $subtract: ['$expired_at', now] }, 1000 * 60 * 60 * 24]
              }
            }
          }
        }
      ])
      .toArray()

    return {
      users: {
        total: totalUsers,
        by_gender: Object.fromEntries(usersByGender.map((g) => [g._id || 'unknown', g.count])),
        by_age_group: {
          '1-17': usersByAgeGroup.find((b) => b._id === 17)?.count || 0,
          '18-25': usersByAgeGroup.find((b) => b._id === 18)?.count || 0,
          '26-35': usersByAgeGroup.find((b) => b._id === 26)?.count || 0,
          '36-50': usersByAgeGroup.find((b) => b._id === 36)?.count || 0,
          '51+': usersByAgeGroup.find((b) => b._id === 51)?.count || 0
        },
        recent_users: recentUsers
      },
      staff: {
        total: totalStaff,
        by_role: byRole
      },
      donations: {
        total: totalDonations,
        by_status: Object.fromEntries(donationsByStatus.map((d) => [d._id, d.count])),
        recent_forms: recentDonationForms,
        completedRate
      },
      requests: {
        total: totalRequests,
        by_status: Object.fromEntries(requestByStatus.map((r) => [r._id, r.count])),
        recent_form: recentRequestForms
      },
      inventory: {
        total: totalUnits,
        by_blood_group_name: defaultGroupCounts,
        by_blood_component_name: defaultComponentCounts,
        expiring_soon: expiringSoon
      }
    }
  }

  async getDashboardWarehouseOverview() {
    const now = new Date()

    // 1. Tính tổng số lượng đơn vị máu
    const allBags = await databaseService.bloodUnits.find({ status: BloodUnitStatus.Available }).toArray()
    const totalUnits = allBags.length

    // 2. Đếm theo nhóm máu
    const bloodGroups = await databaseService.bloodGroups.find({}).toArray()
    const bloodGroupMap = new Map(bloodGroups.map((g) => [g._id.toString(), g.name]))

    const byBloodType: Record<string, number> = {}
    for (const bag of allBags) {
      const groupName = bloodGroupMap.get(bag.blood_group_id.toString()) || 'Unknown'
      byBloodType[groupName] = (byBloodType[groupName] || 0) + 1
    }

    // 3. Đếm theo thành phần máu
    const bloodComponents = await databaseService.bloodComponents.find({}).toArray()
    const componentMap = new Map(bloodComponents.map((c) => [c._id.toString(), c.name]))

    const byComponent: Record<string, number> = {}
    for (const bag of allBags) {
      const componentName = componentMap.get(bag.blood_component_id.toString()) || 'Unknown'
      byComponent[componentName] = (byComponent[componentName] || 0) + 1
    }

    // 4. Túi máu sắp hết hạn (7 ngày)
    const in7Days = new Date(now)
    in7Days.setDate(now.getDate() + 7)

    const expiringSoonDocs = await databaseService.bloodUnits
      .find({
        status: BloodUnitStatus.Available,
        expired_at: { $lte: in7Days }
      })
      .toArray()

    const expiringSoon = expiringSoonDocs
      .filter((bag) => bag.expired_at) // loại bỏ những bag không có expired_at
      .map((bag) => ({
        blood_bag_id: bag._id.toString(),
        blood_group_name: bloodGroupMap.get(bag.blood_group_id?.toString()) || 'Unknown',
        blood_component_name: componentMap.get(bag.blood_component_id?.toString()) || 'Unknown',
        expired_date: bag.expired_at!.toISOString().split('T')[0],
        volume: bag.volume,
        days_left: Math.ceil((bag.expired_at!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))

    // 5. Thống kê nhập / xuất hôm nay và tháng này
    const todayRange = {
      $gte: startOfDay(now),
      $lte: endOfDay(now)
    }

    const monthRange = {
      $gte: startOfMonth(now),
      $lte: endOfMonth(now)
    }

    const todayImported = await databaseService.bloodUnits.countDocuments({
      status: BloodUnitStatus.Available,
      created_at: todayRange
    })

    const todayExported = await databaseService.bloodUnits.countDocuments({
      status: BloodUnitStatus.Used,
      used_at: todayRange
    })

    const monthImported = await databaseService.bloodUnits.countDocuments({
      status: BloodUnitStatus.Available,
      created_at: monthRange
    })

    const monthExported = await databaseService.bloodUnits.countDocuments({
      status: BloodUnitStatus.Used,
      used_at: monthRange
    })

    const importExportStatus = {
      today: {
        imported: todayImported,
        exported: todayExported
      },
      this_month: {
        imported: monthImported,
        exported: monthExported
      }
    }

    // 6. Số lượt hiến máu mỗi tháng (donation_process)
    const donationsPerMonthRaw = await databaseService.donationRegistrations
      .aggregate([
        {
          $match: {
            status: DonationRegistrationStatus.CheckedIn // lọc các đơn đã check-in
          }
        },
        {
          $project: {
            month: { $dateToString: { format: '%Y-%m', date: '$created_at' } }
          }
        },
        {
          $group: {
            _id: '$month',
            donations: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray()

    const donationsPerMonth = donationsPerMonthRaw.map((item) => ({
      month: item._id,
      donations: item.donations
    }))

    // 7. Số túi máu đã sử dụng mỗi tháng
    const bloodUsagePerMonthRaw = await databaseService.bloodUnits
      .aggregate([
        {
          $match: { status: BloodUnitStatus.Used }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$used_at' }
            },
            unitsUsed: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
      .toArray()

    const bloodUsagePerMonth = bloodUsagePerMonthRaw.map((item) => ({
      month: item._id,
      units_used: item.unitsUsed
    }))

    // 8. Tỷ lệ trạng thái đơn hiến máu
    const donationProcessRatio = await databaseService.donationRegistrations
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    // Chuyển về object: { Pending: 10, Approved: 20, ... }
    const donationRatioObject = donationProcessRatio.reduce(
      (acc, cur) => {
        acc[cur._id] = cur.count
        return acc
      },
      {} as Record<string, number>
    )

    // 9. Biểu đồ nhập/xuất mỗi ngày (trong 7 ngày gần đây)
    const last7Days = new Date()
    last7Days.setDate(now.getDate() - 6)

    const bloodImportExportPerDay = await Promise.all(
      Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(last7Days)
        date.setDate(date.getDate() + index)

        const range = {
          $gte: startOfDay(date),
          $lte: endOfDay(date)
        }

        return Promise.all([
          databaseService.bloodUnits.countDocuments({
            status: BloodUnitStatus.Available,
            created_at: range
          }),
          databaseService.bloodUnits.countDocuments({
            status: BloodUnitStatus.Used,
            used_at: range
          })
        ]).then(([imported, exported]) => ({
          date: date.toISOString().split('T')[0],
          imported,
          exported
        }))
      })
    )

    // 10. Biểu đồ số lượng túi sắp hết hạn theo tháng (3 tháng tới)
    const expiringPerMonthRaw = await databaseService.bloodUnits
      .aggregate([
        {
          $match: {
            status: BloodUnitStatus.Available,
            expired_at: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$expired_at' }
            },
            expiring_units: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
      .toArray()

    const expiringPerMonth = expiringPerMonthRaw.map((item) => ({
      month: item._id,
      expiring_units: item.expiring_units
    }))

    return {
      total_units: totalUnits,
      by_blood_type: byBloodType,
      by_component: byComponent,
      expiring_soon: expiringSoon,
      import_export_status: importExportStatus,
      donations_per_month: donationsPerMonth,
      blood_usage_per_month: bloodUsagePerMonth,
      donation_process_ratio: donationRatioObject,
      chart: {
        blood_import_export_per_day: bloodImportExportPerDay,
        expiring_per_month: expiringPerMonth
      }
    }
  }
}

const dashboardService = new DashboardService()
export default dashboardService
