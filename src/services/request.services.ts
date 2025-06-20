import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import {
  HealthCheckStatus,
  RequestProcessStatus,
  RequestRegistrationStatus,
  UserGender,
  UserRole
} from '~/constants/enum'
import { CreateRequestRegistrationReqBody, UpdateRequestRegistrationReqBody } from '~/models/requests/Request.requests'
import HealthCheck from '~/models/schemas/HealthCheck'
import RequestProcess from '~/models/schemas/RequestProcess.schemas'
import RequestRegistration from '~/models/schemas/RequestRegistration.schemas'
import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
config()

class RequestService {
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
    const isValidBloodComponentId = ObjectId.isValid(payload.blood_component_id as string)

    const bloodGroupId = isValidBloodGroupId ? new ObjectId(payload.blood_group_id) : resultUser?.blood_group_id || null
    const bloodComponentId = isValidBloodComponentId ? new ObjectId(payload.blood_component_id) : null

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
      blood_component_id: bloodGroupId,
      blood_group_id: bloodComponentId,
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
      user_id: new ObjectId(user_id),
      blood_group_id: bloodGroupId as ObjectId,
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
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultHealthCheck = await databaseService.healthChecks.insertOne(newHealthCheck)

    const newRequestProcess = new RequestProcess({
      _id: requestProcessId,
      user_id: new ObjectId(user_id),
      request_registration_id: resultRequestRegistration.insertedId,
      blood_group_id: bloodGroupId as ObjectId,
      blood_component_id: bloodComponentId,
      health_check_id: healthCheckId,
      volume_received: 0,
      description: '',
      status: RequestProcessStatus.Pending,
      request_date: new Date(),
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
}

const requestsService = new RequestService()
export default requestsService
