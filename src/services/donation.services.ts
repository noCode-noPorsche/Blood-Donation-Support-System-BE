import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { BloodUnitStatus, DonationProcessStatus, DonationRegistrationStatus, HealthCheckStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { DONATION_MESSAGES, NOTIFICATION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  CreateDonationRegistrationReqBody,
  UpdateDonationProcessReqBody,
  UpdateDonationRegistrationReqBody
} from '~/models/requests/Donation.requests'
import BloodUnit from '~/models/schemas/BloodUnit.schemas'
import DonationProcess from '~/models/schemas/DonationProcess.schemas'
import DonationRegistration from '~/models/schemas/DonationRegistration.schemas'
import HealthCheck from '~/models/schemas/HealthCheck'
import Notification from '~/models/schemas/Notification.schemas'
import { sendPushNotification } from '~/utils/notification'
import { convertTypeToComponentMap } from '~/utils/utils'
import databaseService from './database.services'
import Answer from '~/models/schemas/Answer.schemas'
config()

class DonationService {
  //Donation - Health - Process
  async getAllDonationHealthProcessByUserId(user_id: string) {
    const userObjectId = new ObjectId(user_id)

    const donationRegistrations = await databaseService.donationRegistrations.find({ user_id: userObjectId }).toArray()

    const result = []

    for (const regis of donationRegistrations) {
      const [healthCheck, donationProcess] = await Promise.all([
        regis.health_check_id ? databaseService.healthChecks.findOne({ _id: regis.health_check_id }) : null,
        regis.donation_process_id ? databaseService.donationProcesses.findOne({ _id: regis.donation_process_id }) : null
      ])

      // Get blood group + component names
      const bloodGroup = regis.blood_group_id
        ? await databaseService.bloodGroups.findOne({ _id: regis.blood_group_id })
        : null
      // const bloodComponent = regis.blood_component_id
      //   ? await databaseService.bloodComponents.findOne({ _id: regis.blood_component_id })
      //   : null

      // Gộp và loại field không cần
      const combined = {
        _id: regis._id,
        user_id: regis.user_id,
        donation_process_id: regis.donation_process_id,
        health_check_id: regis.health_check_id,
        status: regis.status,
        start_date_donation: regis.start_date_donation,
        donation_registration_id: healthCheck?.donation_registration_id,
        weight: healthCheck?.weight,
        donation_type: healthCheck?.donation_type,
        temperature: healthCheck?.temperature,
        heart_rate: healthCheck?.heart_rate,
        diastolic_blood_pressure: healthCheck?.diastolic_blood_pressure,
        systolic_blood_pressure: healthCheck?.systolic_blood_pressure,
        underlying_health_condition: healthCheck?.underlying_health_condition,
        hemoglobin: healthCheck?.hemoglobin,
        description: donationProcess?.description || healthCheck?.description,
        volume_collected: donationProcess?.volume_collected,
        donation_date: donationProcess?.donation_date,
        created_at: regis.created_at,

        // Chỉ lấy name
        blood_group: bloodGroup?.name ?? null
        // blood_component: bloodComponent?.name ?? null
      }

      result.push(combined)
    }

    return result
  }

  async getDonationHealthProcessByDonationId(id: string) {
    const regis = await databaseService.donationRegistrations.findOne({
      _id: new ObjectId(id)
    })

    if (!regis) return null

    const [healthCheck, donationProcess] = await Promise.all([
      regis.health_check_id ? databaseService.healthChecks.findOne({ _id: regis.health_check_id }) : null,
      regis.donation_process_id ? databaseService.donationProcesses.findOne({ _id: regis.donation_process_id }) : null
    ])

    // Get blood group + component names
    const bloodGroup = regis.blood_group_id
      ? await databaseService.bloodGroups.findOne({ _id: regis.blood_group_id })
      : null
    // const bloodComponent = regis.blood_component_id
    //   ? await databaseService.bloodComponents.findOne({ _id: regis.blood_component_id })
    //   : null

    // Gộp và loại field không cần
    const combined = {
      _id: regis._id,
      user_id: regis.user_id,
      donation_process_id: regis.donation_process_id,
      health_check_id: regis.health_check_id,
      status: regis.status,
      start_date_donation: regis.start_date_donation,
      donation_registration_id: healthCheck?.donation_registration_id,
      weight: healthCheck?.weight,
      donation_type: healthCheck?.donation_type,
      temperature: healthCheck?.temperature,
      heart_rate: healthCheck?.heart_rate,
      diastolic_blood_pressure: healthCheck?.diastolic_blood_pressure,
      systolic_blood_pressure: healthCheck?.systolic_blood_pressure,
      underlying_health_condition: healthCheck?.underlying_health_condition,
      hemoglobin: healthCheck?.hemoglobin,
      description: donationProcess?.description || healthCheck?.description,
      volume_collected: donationProcess?.volume_collected,
      donation_date: donationProcess?.donation_date,
      created_at: regis.created_at,

      // Chỉ lấy name
      blood_group: bloodGroup?.name ?? null
      // blood_component: bloodComponent?.name ?? null
    }

    return combined
  }

  async getStatusDonationHealthProcessByDonationId(id: string) {
    const result = await databaseService.donationRegistrations.findOne({
      _id: new ObjectId(id)
    })

    if (!result) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND
      })
    }

    const [healthCheck, donationProcess] = await Promise.all([
      result.health_check_id ? databaseService.healthChecks.findOne({ _id: result.health_check_id }) : null,
      result.donation_process_id ? databaseService.donationProcesses.findOne({ _id: result.donation_process_id }) : null
    ])

    const combined = {
      donation_registration_status: result.status,
      health_check_status: healthCheck?.status || null,
      donation_process_status: donationProcess?.status || null
    }

    return combined
  }

  //Donation Registration
  async createDonationRegistration({
    user_id,
    payload
  }: {
    user_id: string
    payload: CreateDonationRegistrationReqBody
  }) {
    const donationProcessId = new ObjectId()
    const healthCheckId = new ObjectId()

    const resultUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    //Kiểm tra blood_group_id
    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const bloodGroupId = isValidBloodGroupId ? new ObjectId(payload.blood_group_id) : resultUser?.blood_group_id || null

    //Từ donation_type ra name và tìm id theo name và gán vào 1 mảng
    const componentNames = convertTypeToComponentMap[payload.donation_type]
    const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()
    const componentIds = componentDocs.map((comp) => comp._id)

    // // Lấy tất cả câu hỏi từ DB
    // const questions = await databaseService.questions.find().toArray()

    // Lọc câu trả lời từ payload
    const answers = payload.answers.map((ans) => ({
      question_id: new ObjectId(ans.question_id),
      answer: ans.answer
    }))

    // Kiểm tra có câu trả lời TRUE hay không
    const hasRejectedAnswer = answers.some((ans) => ans.answer === true)

    //Tạo mới Donation Registration
    const newDonationRegistration = new DonationRegistration({
      ...payload,
      user_id: new ObjectId(user_id),
      donation_process_id: donationProcessId,
      health_check_id: healthCheckId,
      blood_group_id: bloodGroupId,
      blood_component_ids: componentIds,
      donation_type: payload.donation_type,
      status: hasRejectedAnswer ? DonationRegistrationStatus.Rejected : DonationRegistrationStatus.Approved,
      start_date_donation: new Date(payload.start_date_donation),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultRegistration = await databaseService.donationRegistrations.insertOne(newDonationRegistration)

    // Lưu Answer (ghi nhận tất cả, nhưng vẫn có thể filter nếu chỉ muốn true)
    const newAnswer = new Answer({
      _id: new ObjectId(),
      user_id: new ObjectId(user_id),
      donation_registration_id: resultRegistration.insertedId,
      answers,
      created_at: new Date()
    })
    await databaseService.answers.insertOne(newAnswer)

    //Đồng thời tạo mới Health Check
    const newHealthCheck = new HealthCheck({
      _id: healthCheckId,
      user_id: new ObjectId(user_id),
      blood_group_id: bloodGroupId as ObjectId,
      blood_component_ids: componentIds,
      donation_registration_id: resultRegistration.insertedId,
      donation_process_id: donationProcessId,
      donation_type: payload.donation_type,
      request_process_id: null,
      request_registration_id: null,
      weight: 0,
      temperature: 0,
      heart_rate: 0,
      diastolic_blood_pressure: 0,
      systolic_blood_pressure: 0,
      underlying_health_condition: [],
      hemoglobin: 0,
      description: '',
      status: hasRejectedAnswer ? HealthCheckStatus.Rejected : HealthCheckStatus.Pending,
      updated_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultHealthCheck = await databaseService.healthChecks.insertOne(newHealthCheck)

    //Đồng thời tạo mới Donation Processes
    const newDonationProcess = new DonationProcess({
      _id: donationProcessId,
      user_id: new ObjectId(user_id),
      donation_registration_id: resultRegistration.insertedId,
      blood_group_id: bloodGroupId as ObjectId,
      health_check_id: healthCheckId,
      volume_collected: 0,
      description: '',
      is_separated: false,
      status: hasRejectedAnswer ? DonationProcessStatus.Rejected : DonationProcessStatus.Pending,
      donation_date: new Date(payload.start_date_donation),
      updated_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultProcess = await databaseService.donationProcesses.insertOne(newDonationProcess)

    // Nếu có câu trả lời true -> quăng lỗi sau khi tạo dữ liệu
    if (hasRejectedAnswer) {
      throw new ErrorWithStatus({
        message: 'Bạn không đạt đủ yêu cầu để có thể đăng ký hiến máu',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return {
      donationRegistration: resultRegistration,
      donationProcess: resultProcess,
      healthCheck: resultHealthCheck
    }
  }

  async getAllDonationRegistration() {
    const donationRegistration = await databaseService.donationRegistrations
      .aggregate([
        // Join blood group
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group'
          }
        },
        { $unwind: { path: '$blood_group', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

        // Join answers
        {
          $lookup: {
            from: 'answers',
            localField: '_id',
            foreignField: 'donation_registration_id',
            as: 'answers'
          }
        },

        // Giải phẳng answers.answers để join question
        {
          $unwind: {
            path: '$answers',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$answers.answers',
            preserveNullAndEmptyArrays: true
          }
        },

        // Join question
        {
          $lookup: {
            from: 'questions',
            localField: 'answers.answers.question_id',
            foreignField: '_id',
            as: 'question'
          }
        },
        { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },

        // Final projection
        {
          $group: {
            _id: '$_id',
            user_id: { $first: '$user_id' },
            donation_process_id: { $first: '$donation_process_id' },
            health_check_id: { $first: '$health_check_id' },
            status: { $first: '$status' },
            blood_component_ids: { $first: '$blood_component_ids' },
            donation_type: { $first: '$donation_type' },
            start_date_donation: { $first: '$start_date_donation' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            full_name: { $first: '$user.full_name' },
            citizen_id_number: { $first: '$user.citizen_id_number' },
            phone: { $first: '$user.phone' },
            blood_group_name: { $first: '$blood_group.name' },
            answers: {
              $push: {
                question: '$question.name',
                answer: '$answers.answers.answer'
              }
            }
          }
        }
      ])
      .toArray()

    return donationRegistration
  }

  async getDonationRegistrationById(id: string) {
    const donationRegistration = await databaseService.donationRegistrations
      .aggregate([
        { $match: { _id: new ObjectId(id) } },

        // Join blood group
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group'
          }
        },
        { $unwind: { path: '$blood_group', preserveNullAndEmptyArrays: true } },

        // Join user
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

        // Join answers
        {
          $lookup: {
            from: 'answers',
            localField: '_id',
            foreignField: 'donation_registration_id',
            as: 'answers'
          }
        },
        { $unwind: { path: '$answers', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$answers.answers', preserveNullAndEmptyArrays: true } },

        // Join question
        {
          $lookup: {
            from: 'questions',
            localField: 'answers.answers.question_id',
            foreignField: '_id',
            as: 'question'
          }
        },
        { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },

        // Group
        {
          $group: {
            _id: '$_id',
            user_id: { $first: '$user_id' },
            donation_process_id: { $first: '$donation_process_id' },
            health_check_id: { $first: '$health_check_id' },
            status: { $first: '$status' },
            blood_component_ids: { $first: '$blood_component_ids' },
            donation_type: { $first: '$donation_type' },
            start_date_donation: { $first: '$start_date_donation' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            full_name: { $first: '$user.full_name' },
            citizen_id_number: { $first: '$user.citizen_id_number' },
            phone: { $first: '$user.phone' },
            blood_group_name: { $first: '$blood_group.name' },
            answers: {
              $push: {
                question: '$question.name',
                answer: '$answers.answers.answer'
              }
            }
          }
        }
      ])
      .toArray()

    if (!donationRegistration || donationRegistration.length === 0) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return donationRegistration[0]
  }

  async getDonationRegistrationByUserId(user_id: string) {
    const donationRegistration = await databaseService.donationRegistrations
      .aggregate([
        { $match: { user_id: new ObjectId(user_id) } },

        // Join blood group
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group'
          }
        },
        { $unwind: { path: '$blood_group', preserveNullAndEmptyArrays: true } },

        // Join user
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

        // Join answers
        {
          $lookup: {
            from: 'answers',
            localField: '_id',
            foreignField: 'donation_registration_id',
            as: 'answers'
          }
        },
        { $unwind: { path: '$answers', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$answers.answers', preserveNullAndEmptyArrays: true } },

        // Join question
        {
          $lookup: {
            from: 'questions',
            localField: 'answers.answers.question_id',
            foreignField: '_id',
            as: 'question'
          }
        },
        { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },

        // Group
        {
          $group: {
            _id: '$_id',
            user_id: { $first: '$user_id' },
            donation_process_id: { $first: '$donation_process_id' },
            health_check_id: { $first: '$health_check_id' },
            status: { $first: '$status' },
            blood_component_ids: { $first: '$blood_component_ids' },
            donation_type: { $first: '$donation_type' },
            start_date_donation: { $first: '$start_date_donation' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            full_name: { $first: '$user.full_name' },
            citizen_id_number: { $first: '$user.citizen_id_number' },
            phone: { $first: '$user.phone' },
            blood_group_name: { $first: '$blood_group.name' },
            answers: {
              $push: {
                question: '$question.name',
                answer: '$answers.answers.answer'
              }
            }
          }
        }
      ])
      .toArray()

    return donationRegistration
  }

  async updateDonationRegistration({ id, payload }: { id: string; payload: UpdateDonationRegistrationReqBody }) {
    const existsDonationRegistration = await databaseService.donationRegistrations.findOne({ _id: new ObjectId(id) })

    if (!existsDonationRegistration) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Nếu status hiện tại là Rejected => không cho phép cập nhật
    if (existsDonationRegistration.status === DonationRegistrationStatus.Rejected) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_REGISTRATION_REJECTED_CANNOT_UPDATE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const bloodGroupId = isValidBloodGroupId
      ? new ObjectId(payload.blood_group_id)
      : existsDonationRegistration.blood_group_id

    const updateFields: Record<string, any> = {
      status: payload.status || existsDonationRegistration.status,
      blood_group_id: bloodGroupId
    }

    if (bloodGroupId) {
      updateFields.blood_group_id = bloodGroupId

      // Cập nhật luôn blood_group_id của user
      await databaseService.users.updateOne(
        { _id: existsDonationRegistration.user_id },
        {
          $set: {
            blood_group_id: bloodGroupId
          },
          $currentDate: { updated_at: true }
        }
      )

      //Cập nhật blood_group_id trong health checks
      await databaseService.healthChecks.updateOne(
        { donation_registration_id: new ObjectId(id) },
        {
          $set: { blood_group_id: bloodGroupId },
          $currentDate: { updated_at: true }
        }
      )

      //Cập nhật blood_group_id trong donation processes
      await databaseService.donationProcesses.updateOne(
        { donation_registration_id: new ObjectId(id) },
        {
          $set: { blood_group_id: bloodGroupId },
          $currentDate: { updated_at: true }
        }
      )
    }
    if (payload.start_date_donation) {
      updateFields.start_date_donation = new Date(payload.start_date_donation)
      //Cập nhật start_date_donation trong donation processes
      await databaseService.donationProcesses.updateOne(
        { donation_registration_id: new ObjectId(id) },
        {
          $set: { donation_date: new Date(payload.start_date_donation) },
          $currentDate: { updated_at: true }
        }
      )
    }

    // Nếu có thay đổi loại hiến
    let componentIds: ObjectId[] = []
    if ('donation_type' in payload && payload.donation_type) {
      updateFields.donation_type = payload.donation_type

      //Map loại hiến sang các thành phần máu
      const componentNames = convertTypeToComponentMap[payload.donation_type]
      const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()

      componentIds = componentDocs.map((comp) => comp._id)
      updateFields.blood_component_ids = componentIds
    }

    // Cập nhật donation registrations
    const result = await databaseService.donationRegistrations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: updateFields,
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    // Nếu có thay đổi loại hiến, cập nhật luôn bảng healthChecks
    if (payload.donation_type && componentIds.length > 0) {
      await databaseService.healthChecks.updateOne(
        { donation_registration_id: new ObjectId(id) },
        {
          $set: {
            donation_type: payload.donation_type,
            blood_component_ids: componentIds
          },
          $currentDate: { updated_at: true }
        }
      )
    }

    // Gửi thông báo nếu status chuyển sang "checked-in" và trước đó chưa phải checked-in
    if (
      payload.status === DonationRegistrationStatus.CheckedIn &&
      existsDonationRegistration.status !== DonationRegistrationStatus.CheckedIn
    ) {
      const user = await databaseService.users.findOne({ _id: existsDonationRegistration.user_id })

      // Lưu thông báo vào DB
      const title = NOTIFICATION_MESSAGES.CHECKED_IN_DONATION_SUCCESS
      const body = NOTIFICATION_MESSAGES.CHECKED_IN_DONATION_BODY

      const notification = new Notification({
        receiver_id: user?._id as ObjectId,
        donation_registration_id: new ObjectId(id),
        title,
        message: body
      })
      await databaseService.notifications.insertOne(notification)
      // Gửi push notification
      if (user?.fcm_token) {
        await sendPushNotification({
          fcmToken: user.fcm_token,
          title,
          body
        })
      }
    }
    return result
  }

  //Donation Process
  async getAllDonationProcesses(filter: Record<string, any> = {}) {
    const matchStage = Object.keys(filter).length > 0 ? [{ $match: filter }] : []

    const donationProcesses = await databaseService.donationProcesses
      .aggregate([
        ...matchStage,
        // Join user để lấy tên người hiến
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'user_update'
          }
        },
        { $unwind: { path: '$user_update', preserveNullAndEmptyArrays: true } },
        // Join blood_groups để lấy tên nhóm máu
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group_info'
          }
        },
        { $unwind: { path: '$blood_group_info', preserveNullAndEmptyArrays: true } },
        // Join health_checks để lấy thông tin về loại hiến máu
        {
          $lookup: {
            from: 'health_checks',
            localField: 'health_check_id',
            foreignField: '_id',
            as: 'health_check'
          }
        },
        { $unwind: { path: '$health_check', preserveNullAndEmptyArrays: true } },

        // Project các trường cần thiết
        {
          $project: {
            _id: 1,
            user_id: 1,
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            is_separated: 1,
            status: 1,
            volume_collected: 1,
            donation_registration_id: 1,
            health_check_id: 1,
            donation_date: 1,
            description: 1,
            donation_type: '$health_check.donation_type',
            blood_group_id: 1,
            blood_group_name: '$blood_group_info.name',
            updated_by: '$user_update.full_name',
            created_at: 1,
            updated_at: 1
          }
        }
      ])
      .toArray()

    return donationProcesses
  }

  async getDonationProcessById(id: string) {
    const existsDonationProcess = await databaseService.donationProcesses.findOne({ _id: new ObjectId(id) })
    if (!existsDonationProcess) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const result = await databaseService.donationProcesses
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        // Join user để lấy username
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
        // Join blood_group để lấy tên nhóm máu
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
        // Join health_checks để lấy thông tin về loại hiến máu
        {
          $lookup: {
            from: 'health_checks',
            localField: 'health_check_id',
            foreignField: '_id',
            as: 'health_check'
          }
        },
        { $unwind: { path: '$health_check', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            donation_registration_id: 1,
            user_id: 1,
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            blood_group_id: 1,
            blood_group_name: '$blood_group_info.name',
            health_check_id: 1,
            donation_date: 1,
            volume_collected: 1,
            donation_type: '$health_check.donation_type',
            status: 1,
            is_separated: 1,
            description: 1,
            updated_by: '$user_update.full_name',
            created_at: 1,
            updated_at: 1
          }
        }
      ])
      .toArray()

    return result[0]
  }

  async getDonationProcessByUserId(user_id: string) {
    const donationProcesses = await databaseService.donationProcesses
      .aggregate([
        {
          $match: { user_id: new ObjectId(user_id) }
        },
        // Join user để lấy username
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
        // Join blood_group để lấy tên nhóm máu
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
        // Join health_checks để lấy thông tin về loại hiến máu
        {
          $lookup: {
            from: 'health_checks',
            localField: 'health_check_id',
            foreignField: '_id',
            as: 'health_check'
          }
        },
        { $unwind: { path: '$health_check', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            donation_registration_id: 1,
            user_id: 1,
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            blood_group_id: 1,
            blood_group_name: '$blood_group_info.name',
            donation_type: '$health_check.donation_type',
            health_check_id: 1,
            donation_date: 1,
            volume_collected: 1,
            status: 1,
            is_separated: 1,
            description: 1,
            updated_by: '$user_update.full_name',
            created_at: 1,
            updated_at: 1
          }
        }
      ])
      .toArray()

    return donationProcesses
  }

  async updateDonationProcess({
    id,
    payload,
    user_id
  }: {
    id: string
    payload: UpdateDonationProcessReqBody
    user_id: string
  }) {
    const donationProcessResult = await databaseService.donationProcesses.findOne({
      _id: new ObjectId(id)
    })

    if (!donationProcessResult) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const healthCheckResult = await databaseService.healthChecks.findOne({
      _id: new ObjectId(donationProcessResult?.health_check_id)
    })

    //Kiểm tra nếu health check đã reject hoặc pending thì donation process ko dc approved
    const isHealthCheckNotApproved = [HealthCheckStatus.Pending, HealthCheckStatus.Rejected].includes(
      healthCheckResult?.status as HealthCheckStatus
    )
    const isTryingToApprove = payload.status === DonationProcessStatus.Approved

    if (isHealthCheckNotApproved && isTryingToApprove) {
      throw new ErrorWithStatus({
        message:
          DONATION_MESSAGES.BLOOD_DONATION_REQUEST_CANNOT_BE_APPROVED_IF_HEALTH_CHECK_RESULTS_ARE_NOT_SATISFACTORY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    //Cập nhật donation process
    const updateFields: Partial<DonationProcess> = {
      status: payload.status || DonationProcessStatus.Pending,
      blood_group_id: healthCheckResult?.blood_group_id,
      volume_collected: Number(payload.volume_collected),
      description: payload.description || ''
    }

    if (payload.donation_date) {
      updateFields.donation_date = new Date(payload.donation_date)
    }

    const result = await databaseService.donationProcesses.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: updateFields,
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    //Kiểm tra coi lần đầu approved để tạo ra túi máu tương ứng theo thành phần đã hiến +  tăng số lần đã hiến máu của user
    const wasNotApprovedBefore = donationProcessResult?.status !== DonationProcessStatus.Approved
    const isNowApproved = result?.status === DonationProcessStatus.Approved

    if (isNowApproved && wasNotApprovedBefore) {
      const existingUnits = await databaseService.bloodUnits
        .find({
          donation_process_id: new ObjectId(result._id)
        })
        .toArray()

      if (existingUnits.length === 0) {
        //Lấy thông tin healthCheck để biết danh sách thành phần máu đã chọn
        const bloodComponentIds = healthCheckResult?.blood_component_ids || []

        if (bloodComponentIds.length > 0) {
          const bloodComponentDocs = await databaseService.bloodComponents
            .find({ _id: { $in: bloodComponentIds } })
            .toArray()
          const bloodUnits = bloodComponentDocs.map((comp) => {
            return new BloodUnit({
              donation_process_id: new ObjectId(result._id),
              request_process_id: null,
              blood_group_id: result.blood_group_id as ObjectId,
              blood_component_id: comp._id,
              updated_by: new ObjectId(user_id),
              status: BloodUnitStatus.Available,
              volume: 0
            })
          })

          await databaseService.bloodUnits.insertMany(bloodUnits)
        }
        // const bloodComponentDocs = await databaseService.bloodComponents
        //   .find({
        //     name: {
        //       $in: [BloodComponentEnum.RedBloodCells, BloodComponentEnum.Platelets, BloodComponentEnum.Plasma]
        //     }
        //   })
        //   .toArray()
        // const componentMap = bloodComponentDocs.reduce(
        //   (acc, comp) => {
        //     acc[comp.name] = comp._id
        //     return acc
        //   },
        //   {} as Record<string, ObjectId>
        // )
        // const bloodUnits = [
        //   BloodComponentEnum.RedBloodCells,
        //   BloodComponentEnum.Platelets,
        //   BloodComponentEnum.Plasma
        // ].map((name) => {
        //   return new BloodUnit({
        //     donation_process_id: new ObjectId(result._id),
        //     request_process_id: null,
        //     blood_group_id: result.blood_group_id as ObjectId,
        //     blood_component_id: componentMap[name],
        //     updated_by: new ObjectId(user_id),
        //     status: BloodUnitStatus.Available,
        //     volume: 0
        //     // expired_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        //   })
        // })
        // await databaseService.bloodUnits.insertMany(bloodUnits)
      }
      if (result) {
        const userResult = await databaseService.users.findOne({
          _id: new ObjectId(donationProcessResult?.user_id)
        })
        if (userResult) {
          await databaseService.users.findOneAndUpdate(
            { _id: new ObjectId(userResult._id) },
            {
              $set: {
                blood_group_id: healthCheckResult?.blood_group_id || userResult.blood_group_id,
                number_of_donations: userResult?.number_of_donations ? userResult.number_of_donations + 1 : 1
              },
              $currentDate: { updated_at: true }
            }
          )
        }
        // Lưu thông báo vào DB
        const title = NOTIFICATION_MESSAGES.SUCCESSFULLY_DONATED_BLOOD
        const body = NOTIFICATION_MESSAGES.MESSAGE_AFTER_SUCCESSFULLY_DONATED_BLOOD

        const notification = new Notification({
          receiver_id: userResult?._id as ObjectId,
          donation_registration_id: new ObjectId(donationProcessResult?.donation_registration_id),
          title,
          message: body
        })
        await databaseService.notifications.insertOne(notification)
        // Gửi push notification
        if (userResult?.fcm_token) {
          await sendPushNotification({
            fcmToken: userResult.fcm_token,
            title,
            body
          })
        }
      }
    }

    return result
  }
}

const donationService = new DonationService()
export default donationService
