import { ObjectId } from 'mongodb'
import {
  BloodComponentEnum,
  BloodUnitStatus,
  DonationProcessStatus,
  DonationRegistrationStatus,
  HealthCheckStatus
} from '~/constants/enum'
import { DONATION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  DonationRegistrationReqBody,
  UpdateDonationProcessReqBody,
  UpdateDonationRegistrationReqBody
} from '~/models/requests/Donation.requests'
import BloodUnit from '~/models/schemas/BloodUnit.schemas'
import { default as DonationProcess, default as DonationRequestProcess } from '~/models/schemas/DonationProcess.schemas'
import DonationRegistration from '~/models/schemas/DonationRegistration.schemas'
import HealthCheck from '~/models/schemas/HealthCheck'
import databaseService from './database.services'
import { config } from 'dotenv'
import { HTTP_STATUS } from '~/constants/httpStatus'
config()

class DonationService {
  async createDonationRegistration({ user_id, payload }: { user_id: string; payload: DonationRegistrationReqBody }) {
    const donationProcessId = new ObjectId()
    const healthCheckId = new ObjectId()

    const resultUser = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    const isValidBloodGroupId = ObjectId.isValid(payload.blood_group_id as string)
    const isValidBloodComponentId = ObjectId.isValid(payload.blood_component_id as string)

    const bloodGroupId = isValidBloodGroupId ? new ObjectId(payload.blood_group_id) : resultUser?.blood_group_id || null
    const bloodComponentId = isValidBloodComponentId ? new ObjectId(payload.blood_component_id) : null

    const newDonationRegistration = new DonationRegistration({
      ...payload,
      user_id: new ObjectId(user_id),
      status: DonationRegistrationStatus.Approved,
      donation_process_id: donationProcessId,
      health_check_id: healthCheckId,
      blood_group_id: bloodGroupId,
      blood_component_id: bloodComponentId as ObjectId,
      start_date_donation: new Date(payload.start_date_donation),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultRegistration = await databaseService.donationRegistrations.insertOne(newDonationRegistration)

    const newHealthCheck = new HealthCheck({
      _id: healthCheckId,
      user_id: new ObjectId(user_id),
      blood_group_id: bloodGroupId as ObjectId,
      donation_registration_id: resultRegistration.insertedId,
      donation_process_id: donationProcessId,
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
      status: HealthCheckStatus.Pending,
      updated_by: new ObjectId(user_id),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultHealthCheck = await databaseService.healthChecks.insertOne(newHealthCheck)

    const newDonationProcess = new DonationProcess({
      _id: donationProcessId,
      user_id: new ObjectId(user_id),
      donation_registration_id: resultRegistration.insertedId,
      blood_group_id: bloodGroupId as ObjectId,
      health_check_id: healthCheckId,
      volume_collected: 0,
      description: '',
      status: DonationProcessStatus.Pending,
      donation_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    })
    const resultProcess = await databaseService.donationProcesses.insertOne(newDonationProcess)

    return {
      donationRegistration: resultRegistration,
      donationProcess: resultProcess,
      healthCheck: resultHealthCheck
    }
  }

  async getAllDonationRegistration() {
    const donationRegistration = await databaseService.donationRegistrations
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
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component'
          }
        },
        {
          $unwind: {
            path: '$blood_component',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            'blood_group._id': 0,
            'blood_component._id': 0,
            'blood_group.created_at': 0,
            'blood_component.created_at': 0,
            'blood_group.updated_at': 0,
            'blood_component.updated_at': 0
          }
        }
      ])
      .toArray()

    return donationRegistration
  }

  async getDonationRegistrationByUserId(user_id: string) {
    const donationRegistration = await databaseService.donationRegistrations
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
          $lookup: {
            from: 'blood_components',
            localField: 'blood_component_id',
            foreignField: '_id',
            as: 'blood_component'
          }
        },
        {
          $unwind: {
            path: '$blood_component',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            'blood_group._id': 0,
            'blood_group.created_at': 0,
            'blood_group.updated_at': 0,
            'blood_component._id': 0,
            'blood_component.created_at': 0,
            'blood_component.updated_at': 0
          }
        }
      ])
      .toArray()
    if (!donationRegistration) {
      return null
    }
    return donationRegistration
  }

  async updateDonationRegistration({ id, payload }: { id: string; payload: UpdateDonationRegistrationReqBody }) {
    const result = await databaseService.donationRegistrations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...payload,
          blood_group_id: new ObjectId(payload.blood_group_id),
          blood_component_id: new ObjectId(payload.blood_component_id),
          start_date_donation: new Date(payload.start_date_donation),
          status: payload.status
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    return result
  }

  async getAllDonationProcesses() {
    const donationProcesses = await databaseService.donationProcesses
      .aggregate([
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'donation_registration.blood_group_id',
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
          $lookup: {
            from: 'blood_components',
            localField: 'donation_registration.blood_component_id',
            foreignField: '_id',
            as: 'blood_component'
          }
        },
        {
          $unwind: {
            path: '$blood_component',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            'blood_group._id': 0,
            'blood_group.created_at': 0,
            'blood_group.updated_at': 0,
            'blood_component._id': 0,
            'blood_component.created_at': 0,
            'blood_component.updated_at': 0
          }
        }
      ])
      .toArray()
    return donationProcesses
  }

  async getDonationProcessById(id: string) {
    const result = await databaseService.donationProcesses.findOne({ _id: new ObjectId(id) })
    if (!result) {
      throw new ErrorWithStatus({
        message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    return result
  }

  async getDonationProcessByUserId(user_id: string) {
    const donationProcesses = await databaseService.donationProcesses
      .aggregate([
        {
          $match: { user_id: new ObjectId(user_id) }
        },
        {
          $lookup: {
            from: 'donation_registrations',
            localField: 'donation_registration_id',
            foreignField: '_id',
            as: 'donation_registration'
          }
        },
        {
          $unwind: {
            path: '$donation_registration',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            'donation_registration._id': 0,
            'donation_registration.created_at': 0,
            'donation_registration.updated_at': 0
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

    const healthCheckResult = await databaseService.healthChecks.findOne({
      _id: new ObjectId(donationProcessResult?.health_check_id)
    })

    const isHealthCheckNotApproved = [HealthCheckStatus.Pending, HealthCheckStatus.Rejected].includes(
      healthCheckResult?.status as HealthCheckStatus
    )
    const isTryingToApprove = payload.status === DonationProcessStatus.Approved

    if (isHealthCheckNotApproved && isTryingToApprove) {
      throw new ErrorWithStatus({
        message:
          DONATION_MESSAGES.BLOOD_DONATION_REQUEST_CANNOT_BE_APPROVED_IF_HEALTH_CHECK_RESULTS_ARE_NOT_SATISFACTORY,
        status: 400
      })
    }

    const result = await databaseService.donationProcesses.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...payload,
          status: payload.status || DonationProcessStatus.Pending,
          blood_group_id: payload.blood_group_id
            ? new ObjectId(payload.blood_group_id)
            : healthCheckResult?.blood_group_id,
          donation_date: payload.donation_date || new Date(),
          volume_collected: Number(payload.volume_collected)
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    const wasNotApprovedBefore = donationProcessResult?.status !== DonationProcessStatus.Approved
    const isNowApproved = result?.status === DonationProcessStatus.Approved

    if (isNowApproved && wasNotApprovedBefore) {
      const existingUnits = await databaseService.bloodUnits
        .find({
          donation_process_id: new ObjectId(result._id)
        })
        .toArray()

      if (existingUnits.length === 0) {
        const now = new Date()
        const bloodComponentDocs = await databaseService.bloodComponents
          .find({
            name: {
              $in: [BloodComponentEnum.RedBloodCells, BloodComponentEnum.Platelets, BloodComponentEnum.Plasma]
            }
          })
          .toArray()
        const componentMap = bloodComponentDocs.reduce(
          (acc, comp) => {
            acc[comp.name] = comp._id
            return acc
          },
          {} as Record<string, ObjectId>
        )
        const bloodUnits = [
          BloodComponentEnum.RedBloodCells,
          BloodComponentEnum.Platelets,
          BloodComponentEnum.Plasma
        ].map((name) => {
          return new BloodUnit({
            donation_process_id: new ObjectId(result._id),
            request_process_id: null,
            blood_group_id: result.blood_group_id as ObjectId,
            blood_component_id: componentMap[name],
            update_by: new ObjectId(user_id),
            status: BloodUnitStatus.Available,
            volume: 0
            // expired_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          })
        })
        await databaseService.bloodUnits.insertMany(bloodUnits)
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
                blood_group_id: payload.blood_group_id
                  ? new ObjectId(payload.blood_group_id)
                  : userResult.blood_group_id,
                number_of_donations: userResult?.number_of_donations ? userResult.number_of_donations + 1 : 1
              },
              $currentDate: { updated_at: true }
            }
          )
        }
      }
    }

    return result
  }

  //not use
  // async deleteDonationRegistration(id: string) {
  //   let parsedId: ObjectId
  //   try {
  //     parsedId = new ObjectId(id)
  //   } catch (err) {
  //     return false
  //   }
  //   const deletedRegistration = await databaseService.donationRegistrations.findOneAndDelete({ _id: parsedId })
  //   if (!deletedRegistration) {
  //     return null
  //   }
  //   return new DonationRegistration(deletedRegistration)
  // }

  async getDonationProcesses() {
    const donationProcesses = await databaseService.donationProcesses.find({}).toArray()
    return donationProcesses.map((process: DonationProcess) => new DonationProcess(process))
  }

  async getDonationProcess(donationProcessId: string) {
    const donationRequestProcess = await databaseService.donationProcesses.findOne({
      _id: new ObjectId(donationProcessId)
    })
    if (!donationRequestProcess) {
      return null
    }
    return new DonationProcess(donationRequestProcess)
  }

  //not use
  async deleteDonationProcess(id: string) {
    let parsedId: ObjectId
    try {
      parsedId = new ObjectId(id)
    } catch (err) {
      return false
    }
    const deletedProcess = await databaseService.donationProcesses.findOneAndDelete({ _id: parsedId })
    if (!deletedProcess) {
      return null
    }
    return new DonationRequestProcess(deletedProcess)
  }
}

const donationService = new DonationService()
export default donationService
