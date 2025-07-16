import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import {
  BloodUnitStatus,
  HealthCheckStatus,
  RequestProcessBloodStatus,
  RequestProcessDetailStatus,
  RequestProcessStatus,
  RequestRegistrationStatus,
  UserGender,
  UserRole
} from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { REQUEST_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  CreateRequestRegistrationReqBody,
  UpdateRequestProcessBloodIdReqBody,
  UpdateRequestProcessDetailIdReqBody,
  UpdateRequestProcessIdReqBody,
  UpdateRequestRegistrationReqBody
} from '~/models/requests/Request.requests'
import HealthCheck from '~/models/schemas/HealthCheck'
import RequestProcess from '~/models/schemas/RequestProcess.schemas'
import RequestProcessBlood from '~/models/schemas/RequestProcessBlood.schemas'
import RequestRegistration from '~/models/schemas/RequestRegistration.schemas'
import User from '~/models/schemas/User.schemas'
import { convertTypeToComponentMap, isCompatibleDonor } from '~/utils/utils'
import databaseService from './database.services'
import { update } from 'lodash'
config()

class RequestService {
  //Request - Health - Process
  async getRequestHealthProcessByUserId(user_id: string) {
    const userObjectId = new ObjectId(user_id)

    const requestRegistrations = await databaseService.requestRegistrations.find({ user_id: userObjectId }).toArray()

    const result = []

    for (const regis of requestRegistrations) {
      const [healthCheck, requestProcess] = await Promise.all([
        regis.health_check_id ? databaseService.healthChecks.findOne({ _id: regis.health_check_id }) : null,
        regis.request_process_id ? databaseService.requestProcesses.findOne({ _id: regis.request_process_id }) : null
      ])

      // Get blood group name
      const bloodGroup = regis.blood_group_id
        ? await databaseService.bloodGroups.findOne({ _id: regis.blood_group_id })
        : null

      // Get blood component names from requestProcess.blood_component_ids (mảng)
      let bloodComponentNames: string[] = []
      if (requestProcess?.blood_component_ids && requestProcess.blood_component_ids.length > 0) {
        const componentObjects = await databaseService.bloodComponents
          .find({ _id: { $in: requestProcess.blood_component_ids } })
          .toArray()
        bloodComponentNames = componentObjects.map((comp) => comp.name)
      }

      const combined = {
        _id: regis._id,
        user_id: regis.user_id,
        request_process_id: regis.request_process_id,
        health_check_id: regis.health_check_id,
        status: regis.status,
        receive_date_request: regis.receive_date_request,
        is_emergency: regis.is_emergency,
        image: regis.image || null,

        // Health check
        weight: healthCheck?.weight,
        temperature: healthCheck?.temperature,
        heart_rate: healthCheck?.heart_rate,
        diastolic_blood_pressure: healthCheck?.diastolic_blood_pressure,
        systolic_blood_pressure: healthCheck?.systolic_blood_pressure,
        underlying_health_condition: healthCheck?.underlying_health_condition,
        hemoglobin: healthCheck?.hemoglobin,

        // Process
        // volume_received: requestProcess?.volume_received,
        request_date: requestProcess?.request_date,
        description: requestProcess?.description || healthCheck?.description,

        // Names
        blood_group: bloodGroup?.name ?? null,
        blood_components: bloodComponentNames // <-- đây là mảng tên
      }

      result.push(combined)
    }

    return result
  }

  async getRequestHealthProcessByRequestId(id: string) {
    const regis = await databaseService.requestRegistrations.findOne({ _id: new ObjectId(id) })

    if (!regis) return null

    const [healthCheck, requestProcess] = await Promise.all([
      regis.health_check_id ? databaseService.healthChecks.findOne({ _id: regis.health_check_id }) : null,
      regis.request_process_id ? databaseService.requestProcesses.findOne({ _id: regis.request_process_id }) : null
    ])

    const bloodGroup = regis.blood_group_id
      ? await databaseService.bloodGroups.findOne({ _id: regis.blood_group_id })
      : null

    let bloodComponentNames: string[] = []
    if (requestProcess?.blood_component_ids && requestProcess.blood_component_ids.length > 0) {
      const componentObjects = await databaseService.bloodComponents
        .find({ _id: { $in: requestProcess.blood_component_ids } })
        .toArray()
      bloodComponentNames = componentObjects.map((comp) => comp.name)
    }

    const combined = {
      _id: regis._id,
      user_id: regis.user_id,
      request_process_id: regis.request_process_id,
      health_check_id: regis.health_check_id,
      status: regis.status,
      receive_date_request: regis.receive_date_request,
      is_emergency: regis.is_emergency,
      image: regis.image || null,

      // Health Check
      weight: healthCheck?.weight,
      temperature: healthCheck?.temperature,
      heart_rate: healthCheck?.heart_rate,
      diastolic_blood_pressure: healthCheck?.diastolic_blood_pressure,
      systolic_blood_pressure: healthCheck?.systolic_blood_pressure,
      underlying_health_condition: healthCheck?.underlying_health_condition,
      hemoglobin: healthCheck?.hemoglobin,

      // Request Process
      // volume_received: requestProcess?.volume_received,
      request_date: requestProcess?.request_date,
      description: requestProcess?.description || healthCheck?.description,

      // Names
      blood_group: bloodGroup?.name ?? null,
      blood_components: bloodComponentNames
    }

    return combined
  }

  async getStatusRequestHealthProcessByRequestId(id: string) {
    const result = await databaseService.requestRegistrations.findOne({ _id: new ObjectId(id) })

    if (!result) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_REGISTRATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const [healthCheck, requestProcess] = await Promise.all([
      result.health_check_id ? databaseService.healthChecks.findOne({ _id: result.health_check_id }) : null,
      result.request_process_id ? databaseService.requestProcesses.findOne({ _id: result.request_process_id }) : null
    ])

    const combined = {
      request_registration_status: result.status,
      health_check_status: healthCheck?.status || null,
      request_process_status: requestProcess?.status || null
    }

    return combined
  }

  //Request Donation
  async createRequestRegistration({
    user_id,
    payload
  }: {
    user_id: string
    payload: CreateRequestRegistrationReqBody
  }) {
    const healthCheckId = new ObjectId()
    const requestProcessId = new ObjectId()
    let userObjectId: ObjectId

    const resultUser = await databaseService.users.findOne({ citizen_id_number: payload.citizen_id_number })

    //Kiểm tra blood_group_id
    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const bloodGroupId = isValidBloodGroupId ? new ObjectId(payload.blood_group_id) : resultUser?.blood_group_id || null

    //Từ request_type ra name và tìm id theo name và gán vào 1 mảng
    const componentNames = convertTypeToComponentMap[payload.request_type]
    const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()
    const componentIds = componentDocs.map((comp) => comp._id)

    // if (Array.isArray(payload.blood_component_ids)) {
    //   const validIds = payload.blood_component_ids.filter((id) => ObjectId.isValid(id))
    //   bloodComponentIds = validIds.map((id) => new ObjectId(id))
    // }

    if (!resultUser) {
      const date = new Date()
      const newUser = new User({
        citizen_id_number: payload.citizen_id_number,
        email: '',
        phone: payload.phone || '',
        full_name: payload.full_name || '',
        date_of_birth: new Date(),
        gender: UserGender.Other,
        role: UserRole.Customer,
        weight: 0,
        avatar_url: '',
        blood_group_id: bloodGroupId,
        created_at: date,
        updated_at: date,
        location: {
          type: 'Point',
          coordinates: [payload.longitude || 0, payload.latitude || 0]
        },
        address: payload.address || '',
        number_of_donations: 0,
        number_of_requests: 0,
        password: '',
        forgot_password_token: ''
      })
      const result = await databaseService.users.insertOne(newUser)
      userObjectId = result.insertedId
    } else {
      userObjectId = resultUser._id
    }

    const newRequestRegistration = new RequestRegistration({
      blood_component_ids: componentIds,
      blood_group_id: bloodGroupId,
      request_type: payload.request_type,
      is_emergency: payload.is_emergency,
      image: payload.image,
      health_check_id: healthCheckId,
      receive_date_request: new Date(payload.receive_date_request),
      status: RequestRegistrationStatus.Pending,
      note: payload.note,
      request_process_id: requestProcessId,
      user_id: new ObjectId(userObjectId),
      update_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultRequestRegistration = await databaseService.requestRegistrations.insertOne(newRequestRegistration)

    const newHealthCheck = new HealthCheck({
      _id: healthCheckId,
      user_id: new ObjectId(userObjectId),
      blood_group_id: bloodGroupId as ObjectId,
      blood_component_ids: componentIds,
      donation_process_id: null,
      donation_registration_id: null,
      request_registration_id: resultRequestRegistration.insertedId,
      request_process_id: requestProcessId,
      request_type: payload.request_type,
      weight: 0,
      temperature: 0,
      heart_rate: 0,
      diastolic_blood_pressure: 0,
      systolic_blood_pressure: 0,
      underlying_health_condition: [],
      hemoglobin: 0,
      description: '',
      status: HealthCheckStatus.Pending,
      updated_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultHealthCheck = await databaseService.healthChecks.insertOne(newHealthCheck)

    const newRequestProcess = new RequestProcess({
      _id: requestProcessId,
      user_id: new ObjectId(userObjectId),
      request_registration_id: resultRequestRegistration.insertedId,
      blood_group_id: bloodGroupId as ObjectId,
      blood_component_ids: componentIds,
      health_check_id: healthCheckId,
      description: '',
      status: RequestProcessStatus.Pending,
      is_emergency: payload.is_emergency,
      request_date: new Date(),
      updated_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultRequestProcess = await databaseService.requestProcesses.insertOne(newRequestProcess)

    // if (Array.isArray(componentIds) && payload.blood_component_ids.length > 0) {
    //   const componentObjectIds = payload.blood_component_ids.map((id) => new ObjectId(id))

    // Xoá bản cũ nếu có
    // await databaseService.requestProcessDetails.deleteMany({ request_process_id: result?._id })

    // Tạo mới từng detail dựa trên kiểu nhận máu
    const defaultVolume = 0 // hoặc từ payload nếu bạn cho phép nhập
    const detailsToInsert = componentIds.map((componentId) => ({
      request_process_id: requestProcessId,
      blood_component_id: componentId,
      blood_group_id: bloodGroupId as ObjectId,
      volume_required: defaultVolume,
      status: RequestProcessDetailStatus.Pending,
      updated_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    }))

    await databaseService.requestProcessDetails.insertMany(detailsToInsert)
    // }

    return {
      RequestRegistration: resultRequestRegistration,
      HealthCheck: resultHealthCheck,
      RequestProcess: resultRequestProcess
    }
  }

  async updateRequestRegistration({
    id,
    user_id,
    payload
  }: {
    id: string
    user_id: string
    payload: UpdateRequestRegistrationReqBody
  }) {
    const existRequestRegistration = await databaseService.requestRegistrations.findOne({ _id: new ObjectId(id) })
    if (!existRequestRegistration) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: REQUEST_MESSAGES.REQUEST_REGISTRATION_NOT_FOUND
      })
    }
    //Kiểm tra blood_group_id
    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const bloodGroupId = isValidBloodGroupId
      ? new ObjectId(payload.blood_group_id)
      : existRequestRegistration.blood_group_id

    //Từ request_type ra name và tìm id theo name và gán vào 1 mảng
    let componentIds = existRequestRegistration.blood_component_ids || []
    if (payload.request_type) {
      const componentNames = convertTypeToComponentMap[payload.request_type]
      if (!Array.isArray(componentNames)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: REQUEST_MESSAGES.REQUEST_TYPE_INVALID
        })
      }
      const componentDocs = await databaseService.bloodComponents.find({ name: { $in: componentNames } }).toArray()
      componentIds = componentDocs.map((comp) => comp._id)
    }

    const result = await databaseService.requestRegistrations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          request_type: payload.request_type || existRequestRegistration.request_type,
          status: payload.status || existRequestRegistration.status,
          is_emergency: payload.is_emergency || existRequestRegistration.is_emergency,
          image: payload.image || existRequestRegistration.image,
          update_by: new ObjectId(user_id),
          receive_date_request: payload.receive_date_request
            ? new Date(payload.receive_date_request)
            : existRequestRegistration.receive_date_request,
          blood_component_ids: componentIds,
          blood_group_id: bloodGroupId,
          note: payload.note || existRequestRegistration.note
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after'
      }
    )

    // Nếu request registration có health_check_id thì cập nhật health check liên quan
    if (payload.request_type && componentIds.length > 0) {
      await databaseService.healthChecks.updateOne(
        { _id: new ObjectId(existRequestRegistration.health_check_id) },
        {
          $set: {
            request_type: payload.request_type,
            blood_component_ids: componentIds,
            blood_group_id: bloodGroupId as ObjectId
          },
          $currentDate: { updated_at: true }
        }
      )
    }

    // Nếu request registration có request_process_id thì cập nhật health check liên quan
    if (payload.request_type && componentIds.length > 0) {
      await databaseService.requestProcesses.updateOne(
        { _id: new ObjectId(existRequestRegistration.request_process_id) },
        {
          $set: {
            request_type: payload.request_type,
            blood_component_ids: componentIds,
            blood_group_id: bloodGroupId as ObjectId
          },
          $currentDate: { updated_at: true }
        }
      )
    }

    // Cập nhật request_process_detail tương ứng nếu có request_process_id
    if (payload.request_type && componentIds.length > 0 && existRequestRegistration.request_process_id) {
      const requestProcessId = new ObjectId(existRequestRegistration.request_process_id)
      // Xoá các request_process_detail cũ
      await databaseService.requestProcessDetails.deleteMany({ request_process_id: requestProcessId })

      const defaultVolume = 0

      const detailsToInsert = componentIds.map((componentId) => ({
        request_process_id: requestProcessId,
        blood_component_id: componentId,
        blood_group_id: bloodGroupId as ObjectId,
        volume_required: defaultVolume,
        status: RequestProcessDetailStatus.Pending,
        updated_by: new ObjectId(user_id),
        created_at: new Date(),
        updated_at: new Date()
      }))
      await databaseService.requestProcessDetails.insertMany(detailsToInsert)
    }

    return result
  }

  async getRequestRegistrationByUserId(user_id: string) {
    const requestRegistration = await databaseService.requestRegistrations
      .aggregate([
        {
          $match: {
            user_id: new ObjectId(user_id)
          }
        },

        // Join user để lấy full_name, phone
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

        // Join blood_group để lấy name
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

        // Project lại kết quả mong muốn
        {
          $project: {
            _id: 1,
            user_id: 1,
            request_process_id: 1,
            health_check_id: 1,
            status: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            receive_date_request: 1,
            request_type: 1,
            update_by: 1,
            created_at: 1,
            updated_at: 1,
            is_emergency: 1,
            image: 1,
            note: 1,
            // from user
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            // from blood_group
            blood_group_name: '$blood_group_info.name'
          }
        }
      ])
      .toArray()

    return requestRegistration
  }

  async getAllRequestRegistration() {
    const requestRegistration = await databaseService.requestRegistrations
      .aggregate([
        // Join user để lấy full_name, phone
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

        // Join blood_group để lấy name
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
        // Project lại kết quả mong muốn
        {
          $project: {
            _id: 1,
            user_id: 1,
            request_process_id: 1,
            health_check_id: 1,
            status: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            receive_date_request: 1,
            request_type: 1,
            update_by: 1,
            created_at: 1,
            updated_at: 1,
            is_emergency: 1,
            image: 1,
            note: 1,
            // from user
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            // from blood_group
            blood_group_name: '$blood_group_info.name'
          }
        }
      ])
      .toArray()

    return requestRegistration
  }

  async getRequestRegistrationById(id: string) {
    const requestRegistration = await databaseService.requestRegistrations
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        // Join user để lấy full_name, phone
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

        // Join blood_group để lấy name
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

        // Project lại kết quả mong muốn
        {
          $project: {
            _id: 1,
            user_id: 1,
            request_process_id: 1,
            health_check_id: 1,
            status: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            receive_date_request: 1,
            update_by: 1,
            created_at: 1,
            updated_at: 1,
            is_emergency: 1,
            request_type: 1,
            image: 1,
            note: 1,
            // from user
            full_name: '$user_info.full_name',
            phone: '$user_info.phone',
            citizen_id_number: '$user_info.citizen_id_number',
            // from blood_group
            blood_group_name: '$blood_group_info.name'
          }
        }
      ])
      .next()

    if (!requestRegistration) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_REGISTRATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return requestRegistration
  }

  //Request Process
  async getRequestProcessByUserId(user_id: string) {
    const requestProcesses = await databaseService.requestProcesses
      .aggregate([
        {
          $match: { user_id: new ObjectId(user_id) }
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
          $unwind: {
            path: '$blood_group_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            request_registration_id: 1,
            health_check_id: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            description: 1,
            status: 1,
            is_emergency: 1,
            request_date: 1,
            updated_by: 1,
            created_at: 1,
            updated_at: 1,
            request_type: 1,
            blood_group_name: '$blood_group_info.name'
          }
        }
      ])
      .toArray()

    return requestProcesses
  }

  async getAllRequestProcess() {
    const requestProcesses = await databaseService.requestProcesses
      .aggregate([
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
        {
          $project: {
            _id: 1,
            user_id: 1,
            request_registration_id: 1,
            health_check_id: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            description: 1,
            status: 1,
            is_emergency: 1,
            request_date: 1,
            updated_by: 1,
            created_at: 1,
            updated_at: 1,
            request_type: 1,
            // from blood_group
            blood_group_name: '$blood_group_info.name'
          }
        }
      ])
      .toArray()

    return requestProcesses
  }

  async getRequestProcessById(id: string) {
    const result = await databaseService.requestProcesses
      .aggregate([
        {
          $match: { _id: new ObjectId(id) }
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
          $unwind: {
            path: '$blood_group_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            request_registration_id: 1,
            health_check_id: 1,
            blood_group_id: 1,
            blood_component_ids: 1,
            description: 1,
            status: 1,
            is_emergency: 1,
            request_date: 1,
            updated_by: 1,
            created_at: 1,
            updated_at: 1,
            request_type: 1,
            blood_group_name: '$blood_group_info.name'
          }
        }
      ])
      .toArray()

    if (!result.length) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return result[0]
  }

  async updateRequestProcessById({
    id,
    user_id,
    payload
  }: {
    id: string
    user_id: string
    payload: UpdateRequestProcessIdReqBody
  }) {
    const resultRequestProcess = await databaseService.requestProcesses.findOne({ _id: new ObjectId(id) })
    if (!resultRequestProcess) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    // const bloodGroupId = isValidBloodGroupId
    //   ? new ObjectId(payload.blood_group_id)
    //   : resultRequestProcess.blood_group_id

    const result = await databaseService.requestProcesses.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: payload.status,
          is_emergency: payload.is_emergency,
          description: payload.description,
          request_date: payload.request_date,
          updated_by: new ObjectId(user_id)
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after'
      }
    )

    // if (Array.isArray(payload.blood_component_ids) && payload.blood_component_ids.length > 0) {
    //   const componentObjectIds = payload.blood_component_ids.map((id) => new ObjectId(id))

    //   // Xoá bản cũ nếu có
    //   await databaseService.requestProcessDetails.deleteMany({ request_process_id: result?._id })

    //   // Tạo mới từng detail
    //   const defaultVolume = 250 // hoặc từ payload nếu bạn cho phép nhập
    //   const now = new Date()

    //   const detailsToInsert = componentObjectIds.map((componentId) => ({
    //     request_process_id: new ObjectId(result?._id),
    //     blood_component_id: componentId,
    //     blood_group_id: bloodGroupId,
    //     volume_required: defaultVolume,
    //     status: RequestProcessDetailStatus.Pending,
    //     updated_by: new ObjectId(user_id),
    //     created_at: now,
    //     updated_at: now
    //   }))

    //   await databaseService.requestProcessDetails.insertMany(detailsToInsert)
    // }

    // await databaseService.requestProcessBloods.deleteMany({
    //   request_process_id: new ObjectId(id)
    // })

    // // 1. Lấy tất cả túi máu còn dùng được
    // const allAvailableUnits = await databaseService.bloodUnits
    //   .find({
    //     status: BloodUnitStatus.Available,
    //     volume: { $gt: 0 },
    //     expired_at: { $gt: new Date() }
    //   })
    //   .toArray()

    // // 2. Lọc nhóm máu tương thích
    // const compatibleUnits = []

    // for (const unit of allAvailableUnits) {
    //   const isCompatible = await isCompatibleDonor(
    //     result?.blood_group_id.toString() as string,
    //     unit.blood_group_id.toString()
    //   )

    //   if (isCompatible) {
    //     compatibleUnits.push(unit)
    //   }
    // }

    // // 3. Với từng thành phần cần thiết, lọc túi máu tương ứng
    // for (const componentId of result?.blood_component_ids || []) {
    //   const matchingUnits = compatibleUnits.filter(
    //     (unit) => unit.blood_component_id.toString() === componentId.toString()
    //   )

    //   for (const unit of matchingUnits) {
    //     const newMapping: RequestProcessBlood = {
    //       request_process_id: new ObjectId(id),
    //       blood_unit_id: unit._id,
    //       blood_component_id: unit.blood_component_id,
    //       blood_group_id: unit.blood_group_id,
    //       volume: unit.volume ?? 0,
    //       status: RequestProcessBloodStatus.Pending,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //       updated_by: new ObjectId(user_id)
    //     }

    //     await databaseService.requestProcessBloods.insertOne(newMapping)
    //   }
    // }
    return result
  }

  //Request Process Detail
  async getRequestProcessDetailByProcessId(id: string) {
    const requestProcessDetail = await databaseService.requestProcessDetails
      .aggregate([
        {
          $match: {
            request_process_id: new ObjectId(id)
          }
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
          $unwind: {
            path: '$blood_group_info',
            preserveNullAndEmptyArrays: true
          }
        },
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
        {
          $project: {
            _id: 1,
            request_process_id: 1,
            blood_group_id: 1,
            blood_component_id: 1,
            volume_required: 1,
            status: 1,
            updated_by: 1,
            created_at: 1,
            updated_at: 1,
            blood_group_name: '$blood_group_info.name',
            blood_component_name: '$blood_component_info.name'
          }
        }
      ])
      .toArray()

    if (!requestProcessDetail.length) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_PROCESS_DETAIL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return requestProcessDetail
  }

  async updateRequestProcessDetailByProcessId({
    id,
    user_id,
    payload
  }: {
    id: string
    user_id: string
    payload: UpdateRequestProcessDetailIdReqBody[]
  }) {
    const requestProcessId = new ObjectId(id)
    const existingDetails = await databaseService.requestProcessDetails
      .find({ request_process_id: requestProcessId })
      .toArray()

    if (!Array.isArray(payload)) {
      throw new ErrorWithStatus({
        message: 'Payload must be an array',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const updateRequestProcessDetail = []
    const requestProcessBloodList = []

    for (const item of payload) {
      if (!item.blood_component_id) continue

      const componentId = new ObjectId(item.blood_component_id)

      const detailToUpdate = existingDetails.find(
        (detail) => detail.blood_component_id.toString() === componentId.toString()
      )

      if (!detailToUpdate) {
        throw new ErrorWithStatus({
          message: `Không tìm thấy chi tiết cho blood_component_id: ${item.blood_component_id}`,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      const result = await databaseService.requestProcessDetails.findOneAndUpdate(
        { _id: detailToUpdate._id },
        {
          $set: {
            // request_process_id: requestProcessId,
            blood_component_id: componentId,
            volume_required: item.volume_required,
            status: item.status || detailToUpdate.status,
            updated_by: new ObjectId(user_id)
          },
          $currentDate: { updated_at: true }
        },
        {
          returnDocument: 'after'
        }
      )

      if (result) {
        updateRequestProcessDetail.push(result)
        // request process blood
        await databaseService.requestProcessBloods.deleteMany({
          request_process_id: new ObjectId(id)
        })

        const requestProcess = await databaseService.requestProcesses.findOne({
          _id: requestProcessId
        })

        if (!requestProcess?.blood_group_id) {
          throw new ErrorWithStatus({
            message: 'Request process is missing blood_group_id',
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        if (!requestProcess) {
          throw new ErrorWithStatus({
            message: 'Không tìm thấy request process',
            status: HTTP_STATUS.NOT_FOUND
          })
        }

        // 1. Lấy tất cả túi máu còn dùng được
        const allAvailableUnits = await databaseService.bloodUnits
          .find({
            status: BloodUnitStatus.Available,
            volume: { $gt: 0 },
            expired_at: { $gt: new Date() }
          })
          .toArray()

        // 2. Lọc nhóm máu tương thích
        const compatibleUnits = []
        for (const unit of allAvailableUnits) {
          const isCompatible = await isCompatibleDonor(
            requestProcess?.blood_group_id.toString() as string,
            unit.blood_group_id.toString() as string
          )
          if (isCompatible) {
            compatibleUnits.push(unit)
          }
        }

        const insertedBloodMappings: RequestProcessBlood[] = []
        // 3. Với từng thành phần cần thiết, lọc túi máu tương ứng
        for (const componentId of requestProcess?.blood_component_ids || []) {
          const matchingUnits = compatibleUnits.filter(
            (unit) => unit.blood_component_id.toString() === componentId.toString()
          )

          for (const unit of matchingUnits) {
            const newMapping: RequestProcessBlood = {
              request_process_detail_id: result._id,
              request_process_id: new ObjectId(id),
              blood_unit_id: unit._id,
              blood_component_id: unit.blood_component_id,
              blood_group_id: unit.blood_group_id,
              volume: unit.volume ?? 0,
              status: RequestProcessBloodStatus.Pending,
              created_at: new Date(),
              updated_at: new Date(),
              updated_by: new ObjectId(user_id)
            }
            const resultTest = await databaseService.requestProcessBloods.insertOne(newMapping)
            insertedBloodMappings.push(newMapping)
            if (resultTest) {
              console.log('insertedBloodMappings', insertedBloodMappings)
            }
          }
        }
      }
    }

    return updateRequestProcessDetail
  }

  //Request Process Blood
  async getRequestProcessBloodByProcessId(id: string) {
    const requestProcessBlood = await databaseService.requestProcessBloods
      .aggregate([
        { $match: { request_process_id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group_info'
          }
        },
        {
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component_info'
          }
        },
        {
          $unwind: { path: '$blood_group_info', preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: '$blood_component_info', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            request_process_detail_id: 1,
            request_process_id: 1,
            blood_component_id: 1,
            blood_group_id: 1,
            blood_unit_id: 1,
            volume: 1,
            status: 1,
            updated_by: 1,
            created_at: 1,
            updated_at: 1,
            blood_group_name: '$blood_group_info.name',
            blood_component_name: '$blood_component_info.name'
          }
        }
      ])
      .toArray()

    if (!requestProcessBlood || requestProcessBlood.length === 0) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_PROCESS_DETAIL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return requestProcessBlood
  }

  // async updateRequestProcessBloodByProcessId({
  //   id,
  //   user_id,
  //   payload
  // }: {
  //   id: string
  //   user_id: string
  //   payload: UpdateRequestProcessBloodIdReqBody[]
  // }) {
  //   const requestProcessId = new ObjectId(id)

  //   if (!Array.isArray(payload)) {
  //     throw new ErrorWithStatus({
  //       message: 'Payload must be an array',
  //       status: HTTP_STATUS.BAD_REQUEST
  //     })
  //   }

  //   const existingProcessBloods = await databaseService.requestProcessBloods
  //     .find({ request_process_id: requestProcessId })
  //     .toArray()

  //   if (!existingProcessBloods.length) {
  //     throw new ErrorWithStatus({
  //       message: REQUEST_MESSAGES.REQUEST_PROCESS_BLOOD_NOT_FOUND,
  //       status: HTTP_STATUS.NOT_FOUND
  //     })
  //   }
  //   const updatedResults = []

  //   for (const item of payload) {
  //     if (!item.blood_component_id) continue

  //     const componentId = new ObjectId(item.blood_component_id)

  //     const targetBloods = existingProcessBloods.filter(
  //       (blood) => blood.blood_component_id.toString() === componentId.toString()
  //     )

  //     if (targetBloods.length === 0) {
  //       console.warn(`Không tìm thấy record cho component: ${item.blood_component_id}`)
  //       continue
  //     }

  //     for (const blood of targetBloods) {
  //       const updateResult = await databaseService.requestProcessBloods.findOneAndUpdate(
  //         { _id: blood._id },
  //         {
  //           $set: {
  //             status: item.status,
  //             updated_by: new ObjectId(user_id)
  //           },
  //           $currentDate: { updated_at: true }
  //         },
  //         { returnDocument: 'after' }
  //       )

  //       if (updateResult) {
  //         updatedResults.push(updateResult)
  //         if (item.status === RequestProcessBloodStatus.Selected) {
  //           // 1. Cập nhật request_process_detail tương ứng
  //           await databaseService.requestProcessDetails.updateOne(
  //             {
  //               blood_component_id: updateResult.blood_component_id
  //             },
  //             {
  //               $set: {
  //                 status: RequestProcessDetailStatus.Matched,
  //                 updated_by: new ObjectId(user_id)
  //               },
  //               $currentDate: { updated_at: true }
  //             }
  //           )

  //           // 2. Đánh dấu blood_unit đã được sử dụng
  //           await databaseService.bloodUnits.updateOne(
  //             {
  //               _id: updateResult.blood_unit_id
  //             },
  //             {
  //               $set: {
  //                 status: BloodUnitStatus.Used,
  //                 updated_by: new ObjectId(user_id)
  //               },
  //               $currentDate: { updated_at: true }
  //             }
  //           )
  //           // 3. Đánh dấu request_process thành công
  //           await databaseService.requestProcesses.updateOne(
  //             {
  //               _id: updateResult.request_process_id
  //             },
  //             {
  //               $set: {
  //                 status: RequestProcessStatus.Approved,
  //                 updated_by: new ObjectId(user_id)
  //               },
  //               $currentDate: { updated_at: true }
  //             }
  //           )
  //         }
  //       }
  //     }
  //   }

  //   return updatedResults
  // }

  async updateRequestProcessBloodByProcessId({
    id,
    user_id,
    payload
  }: {
    id: string
    user_id: string
    payload: UpdateRequestProcessBloodIdReqBody[]
  }) {
    const requestProcessId = new ObjectId(id)

    if (!Array.isArray(payload)) {
      throw new ErrorWithStatus({
        message: 'Payload must be an array',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const existingProcessBloods = await databaseService.requestProcessBloods
      .find({ request_process_id: requestProcessId })
      .toArray()

    if (!existingProcessBloods.length) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_PROCESS_BLOOD_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const updatedResults = []

    for (const item of payload) {
      if (!item.blood_component_id || !item.blood_unit_id) continue

      const blood = existingProcessBloods.find(
        (b) => b.blood_unit_id && b.blood_unit_id.toString() === item.blood_unit_id
      )

      if (!blood) {
        console.warn(`Không tìm thấy blood unit với id: ${item.blood_unit_id}`)
        continue
      }

      console.log('Found blood record, current status:', blood.status)

      if (item.status !== RequestProcessBloodStatus.Selected) continue

      const updateResult = await databaseService.requestProcessBloods.findOneAndUpdate(
        { _id: blood._id },
        {
          $set: {
            status: RequestProcessBloodStatus.Selected,
            updated_by: new ObjectId(user_id)
          },
          $currentDate: { updated_at: true }
        },
        { returnDocument: 'after' }
      )

      if (updateResult) {
        updatedResults.push(updateResult)

        // Cập nhật request_process_detail.status = "Matched"
        await databaseService.requestProcessDetails.updateOne(
          {
            request_process_id: requestProcessId,
            blood_component_id: blood.blood_component_id
          },
          {
            $set: {
              status: RequestProcessDetailStatus.Matched,
              updated_by: new ObjectId(user_id)
            },
            $currentDate: { updated_at: true }
          }
        )

        // Update các túi máu còn lại thành "Canceled"
        await databaseService.requestProcessBloods.updateMany(
          {
            request_process_id: requestProcessId,
            blood_component_id: blood.blood_component_id,
            _id: { $ne: blood._id }
          },
          {
            $set: {
              status: RequestProcessBloodStatus.Canceled,
              updated_by: new ObjectId(user_id)
            },
            $currentDate: { updated_at: true }
          }
        )
      }
    }

    return updatedResults
  }

  async confirmRequestProcessBloodTaken({ id, user_id }: { id: string; user_id: string }) {
    const requestProcessId = new ObjectId(id)

    // 1. Lấy tất cả các request_process_blood có status = "Selected"
    const selectedBloods = await databaseService.requestProcessBloods
      .find({
        request_process_id: requestProcessId,
        status: RequestProcessBloodStatus.Selected
      })
      .toArray()

    if (selectedBloods.length === 0) {
      throw new ErrorWithStatus({
        message: 'Không có túi máu nào đang được chọn để xác nhận',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    for (const blood of selectedBloods) {
      // 2. Cập nhật request_process_blood sang Done
      await databaseService.requestProcessBloods.updateOne(
        { _id: blood._id },
        {
          $set: {
            status: RequestProcessBloodStatus.Done,
            updated_by: new ObjectId(user_id)
          },
          $currentDate: { updated_at: true },

          returnDocument: 'after'
        }
      )

      // 3. Nếu có blood_unit_id thì cập nhật blood_unit thành Used
      if (blood.blood_unit_id) {
        await databaseService.bloodUnits.updateOne(
          { _id: blood.blood_unit_id },
          {
            $set: {
              status: BloodUnitStatus.Used,
              updated_by: new ObjectId(user_id)
            },
            $currentDate: { updated_at: true }
          }
        )
      }
    }

    // 4. Cập nhật request_process sang Approved
    const updatedProcess = await databaseService.requestProcesses.findOneAndUpdate(
      { _id: requestProcessId },
      {
        $set: {
          status: RequestProcessStatus.Approved,
          updated_by: new ObjectId(user_id)
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    // 5. Cập nhật số lần hiến máu (number_of_requests) của user lên 1
    if (updatedProcess?.user_id) {
      await databaseService.users.updateOne(
        { _id: updatedProcess.user_id },
        {
          $inc: { number_of_requests: 1 },
          $currentDate: { updated_at: true }
        }
      )
    }
    return selectedBloods
  }
}

const requestsService = new RequestService()
export default requestsService
