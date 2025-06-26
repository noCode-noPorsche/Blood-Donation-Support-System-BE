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
import { isCompatibleDonor } from '~/utils/utils'
import databaseService from './database.services'
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
        volume_received: requestProcess?.volume_received,
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

  async getRequestHealthProcessByRequestId(request_id: string) {
    const requestObjectId = new ObjectId(request_id)

    const regis = await databaseService.requestRegistrations.findOne({ _id: requestObjectId })

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
      volume_received: requestProcess?.volume_received,
      request_date: requestProcess?.request_date,
      description: requestProcess?.description || healthCheck?.description,

      // Names
      blood_group: bloodGroup?.name ?? null,
      blood_components: bloodComponentNames
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

    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const bloodGroupId = isValidBloodGroupId ? new ObjectId(payload.blood_group_id) : resultUser?.blood_group_id || null

    let bloodComponentIds: ObjectId[] | null = null

    if (Array.isArray(payload.blood_component_ids)) {
      const validIds = payload.blood_component_ids.filter((id) => ObjectId.isValid(id))
      bloodComponentIds = validIds.map((id) => new ObjectId(id))
    }

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
        location: '',
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
      blood_component_ids: bloodComponentIds,
      blood_group_id: bloodGroupId,
      is_emergency: payload.is_emergency,
      update_by: new ObjectId(user_id),
      image: payload.image,
      health_check_id: healthCheckId,
      receive_date_request: payload.receive_date_request || new Date(),
      status: RequestRegistrationStatus.Approved,
      request_process_id: requestProcessId,
      user_id: new ObjectId(userObjectId),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultRequestRegistration = await databaseService.requestRegistrations.insertOne(newRequestRegistration)

    const newHealthCheck = new HealthCheck({
      _id: healthCheckId,
      user_id: new ObjectId(userObjectId),
      blood_group_id: bloodGroupId as ObjectId,
      blood_component_ids: bloodComponentIds,
      donation_process_id: null,
      donation_registration_id: null,
      request_registration_id: resultRequestRegistration.insertedId,
      request_process_id: requestProcessId,
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
      blood_component_ids: [],
      health_check_id: healthCheckId,
      volume_received: 0,
      description: '',
      status: RequestProcessStatus.Pending,
      is_emergency: payload.is_emergency,
      request_date: new Date(),
      updated_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultRequestProcess = await databaseService.requestProcesses.insertOne(newRequestProcess)

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
    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const isValidBloodComponentId = ObjectId.isValid(payload.blood_component_id as string)

    const bloodGroupId = isValidBloodGroupId ? new ObjectId(payload.blood_group_id) : null
    const bloodComponentId = isValidBloodComponentId ? new ObjectId(payload.blood_component_id) : null

    const result = await databaseService.requestRegistrations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...payload,
          status: payload.status,
          is_emergency: payload.is_emergency,
          image: payload.image,
          update_by: new ObjectId(user_id),
          receive_date_request: payload.receive_date_request,
          blood_component_id: bloodComponentId,
          blood_group_id: bloodGroupId
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after'
      }
    )
    return result
  }

  async getRequestRegistrationByUserId(user_id: string) {
    const requestRegistration = await databaseService.requestRegistrations
      .find({ user_id: new ObjectId(user_id) })
      .toArray()
    return requestRegistration
  }

  async getAllRequestRegistration() {
    const requestRegistration = await databaseService.requestRegistrations.find({}).toArray()
    return requestRegistration
  }

  async getRequestRegistrationById(id: string) {
    const requestRegistration = await databaseService.requestRegistrations.findOne({ _id: new ObjectId(id) })
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
    const requestProcess = await databaseService.requestProcesses.find({ user_id: new ObjectId(user_id) }).toArray()
    return requestProcess
  }

  async getAllRequestProcess() {
    const requestProcess = await databaseService.requestProcesses.find({}).toArray()
    return requestProcess
  }

  async getRequestProcessById(id: string) {
    const requestProcess = await databaseService.requestProcesses.findOne({ _id: new ObjectId(id) })
    if (!requestProcess) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return requestProcess
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

    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const bloodGroupId = isValidBloodGroupId
      ? new ObjectId(payload.blood_group_id)
      : resultRequestProcess.blood_group_id

    const result = await databaseService.requestProcesses.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...payload,
          status: payload.status,
          is_emergency: payload.is_emergency,
          volume_received: payload.volume_received,
          blood_group_id: bloodGroupId,
          description: payload.description,
          blood_component_ids: Array.isArray(payload.blood_component_ids)
            ? payload.blood_component_ids.map((id) => new ObjectId(id))
            : [],
          updated_by: new ObjectId(user_id),
          request_date: payload.request_date
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after'
      }
    )

    if (Array.isArray(payload.blood_component_ids) && payload.blood_component_ids.length > 0) {
      const componentObjectIds = payload.blood_component_ids.map((id) => new ObjectId(id))

      // Xoá bản cũ nếu có
      await databaseService.requestProcessDetails.deleteMany({ request_process_id: result?._id })

      // Tạo mới từng detail
      const defaultVolume = 250 // hoặc từ payload nếu bạn cho phép nhập
      const now = new Date()

      const detailsToInsert = componentObjectIds.map((componentId) => ({
        request_process_id: new ObjectId(result?._id),
        blood_component_id: componentId,
        blood_group_id: bloodGroupId,
        volume_required: defaultVolume,
        status: RequestProcessDetailStatus.Pending,
        updated_by: new ObjectId(user_id),
        created_at: now,
        updated_at: now
      }))

      await databaseService.requestProcessDetails.insertMany(detailsToInsert)
    }

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
      .find({ request_process_id: new ObjectId(id) })
      .toArray()
    if (!requestProcessDetail) {
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
            request_process_id: requestProcessId,
            blood_component_id: componentId,
            volume_required: item.volume_required,
            status: item.status,
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
        //request process blood
        await databaseService.requestProcessBloods.deleteMany({
          request_process_id: new ObjectId(id)
        })

        const requestProcess = await databaseService.requestProcesses.findOne({
          _id: requestProcessId
        })

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
            unit.blood_group_id.toString()
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

    return { updateRequestProcessDetail }
  }

  //Request Process Blood
  async getRequestProcessBloodByProcessId(id: string) {
    const requestProcessBlood = await databaseService.requestProcessBloods
      .find({ request_process_id: new ObjectId(id) })
      .toArray()
    if (!requestProcessBlood) {
      throw new ErrorWithStatus({
        message: REQUEST_MESSAGES.REQUEST_PROCESS_DETAIL_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return requestProcessBlood
  }

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
      if (!item.blood_component_id) continue

      const componentId = new ObjectId(item.blood_component_id)

      const targetBloods = existingProcessBloods.filter(
        (blood) => blood.blood_component_id.toString() === componentId.toString()
      )

      if (targetBloods.length === 0) {
        console.warn(`Không tìm thấy record cho component: ${item.blood_component_id}`)
        continue
      }

      for (const blood of targetBloods) {
        const updateResult = await databaseService.requestProcessBloods.findOneAndUpdate(
          { _id: blood._id },
          {
            $set: {
              status: item.status,
              updated_by: new ObjectId(user_id)
            },
            $currentDate: { updated_at: true }
          },
          { returnDocument: 'after' }
        )

        if (updateResult) {
          updatedResults.push(updateResult)
          if (item.status === RequestProcessBloodStatus.Selected) {
            // 1. Cập nhật request_process_detail tương ứng
            await databaseService.requestProcessDetails.updateOne(
              {
                blood_component_id: updateResult.blood_component_id
              },
              {
                $set: {
                  status: RequestProcessDetailStatus.Matched,
                  updated_by: new ObjectId(user_id)
                },
                $currentDate: { updated_at: true }
              }
            )

            // 2. Đánh dấu blood_unit đã được sử dụng
            await databaseService.bloodUnits.updateOne(
              {
                _id: updateResult.blood_unit_id
              },
              {
                $set: {
                  status: BloodUnitStatus.Used,
                  updated_by: new ObjectId(user_id)
                },
                $currentDate: { updated_at: true }
              }
            )
            // 3. Đánh dấu request_process thành công
            await databaseService.requestProcesses.updateOne(
              {
                _id: updateResult.request_process_id
              },
              {
                $set: {
                  status: RequestProcessStatus.Approved,
                  updated_by: new ObjectId(user_id)
                },
                $currentDate: { updated_at: true }
              }
            )
          }
        }
      }
    }

    return updatedResults
  }
}

const requestsService = new RequestService()
export default requestsService
