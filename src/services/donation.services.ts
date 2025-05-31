import { ObjectId } from 'mongodb'
import DonationRegister from '~/models/schemas/DonationRegister.schemas'
import DonationRequestProcess from '~/models/schemas/DonationRequestProcess.schemas'
import databaseService from './database.services'
import {
  RegisterDonationReqBody,
  UpdateDonationRegistrationReqBody,
  UpdateDonationRequestProcessReqBody
} from '~/models/requests/Donation.request'
import { DonationRegisterStatus, DonationRequestProcessStatus } from '~/constants/enum'

class DonationService {
  async registerDonation({ user_id, payload }: { user_id: string; payload: RegisterDonationReqBody }) {
    const donationRequestProcessId = new ObjectId()
    const newDonationRegister = new DonationRegister({
      ...payload,
      user_id: new ObjectId(user_id),
      status: DonationRegisterStatus.Pending,
      donation_request_process_id: donationRequestProcessId,
      blood_group_id: new ObjectId(payload.blood_group_id),
      blood_component_id: new ObjectId(payload.blood_component_id),
      start_date_donation: new Date(payload.start_date_donation),
      created_date: new Date(),
      updated_date: new Date()
    })

    const resultRegistration = await databaseService.donationRegistrations.insertOne(newDonationRegister)

    const newDonationRequestProcess = new DonationRequestProcess({
      user_id: new ObjectId(user_id),
      donation_registration_id: resultRegistration.insertedId,
      volume_collected: 0,
      _id: donationRequestProcessId,
      status: DonationRequestProcessStatus.Pending,
      donation_date: new Date(),
      created_date: new Date(),
      updated_date: new Date()
    })

    const resultProcess = await databaseService.donationRequestProcess.insertOne(newDonationRequestProcess)
    return {
      donationRegistration: resultRegistration,
      donationRequestProcess: resultProcess
    }
  }

  async getAllDonationRegisters() {
    const donationRegisters = await databaseService.donationRegistrations
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

    return donationRegisters
  }

  async getDonationRegisterByUserId(user_id: string) {
    const donationRegister = await databaseService.donationRegistrations
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
    if (!donationRegister) {
      return null
    }
    return donationRegister
  }

  async updateStatusDonationRegistration({ id, status }: { id: string; status: DonationRegisterStatus }) {
    const result = await databaseService.donationRegistrations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status }, $currentDate: { updated_date: true } },
      { returnDocument: 'after' }
    )
    return result
  }

  async updateDonationRegistration({ id, payload }: { id: string; payload: UpdateDonationRegistrationReqBody }) {
    const result = await databaseService.donationRegistrations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...payload,
          blood_group_id: new ObjectId(payload.blood_group_id),
          blood_component_id: new ObjectId(payload.blood_component_id),
          start_date_donation: new Date(payload.start_date_donation)
        },
        $currentDate: { updated_date: true }
      },
      { returnDocument: 'after' }
    )
    return result
  }

  async getAllDonationRequestProcesses() {
    const donationRequestProcesses = await databaseService.donationRequestProcess
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
    return donationRequestProcesses
  }

  async getDonationRequestProcessByUserId(user_id: string) {
    const donationRequestProcesses = await databaseService.donationRequestProcess
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
    return donationRequestProcesses
  }

  async updateStatusDonationRequestProcess({ id, status }: { id: string; status: DonationRequestProcessStatus }) {
    const result = await databaseService.donationRequestProcess.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status }, $currentDate: { updated_date: true } },
      { returnDocument: 'after' }
    )
    return result
  }

  async updateDonationRequestProcess({ id, payload }: { id: string; payload: UpdateDonationRequestProcessReqBody }) {
    const result = await databaseService.donationRequestProcess.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...payload,
          donation_date: payload.donation_date || new Date(),
          volume_collected: Number(payload.volume_collected)
        },
        $currentDate: { updated_date: true }
      },
      { returnDocument: 'after' }
    )
    return result
  }

  //not use
  async deleteDonationRegistration(id: string) {
    let parsedId: ObjectId
    try {
      parsedId = new ObjectId(id)
    } catch (err) {
      return false
    }
    const deletedRegistration = await databaseService.donationRegistrations.findOneAndDelete({ _id: parsedId })
    if (!deletedRegistration) {
      return null
    }
    return new DonationRegister(deletedRegistration)
  }
  async getDonationRequestProcesses() {
    const donationRequestProcesses = await databaseService.donationRequestProcess.find({}).toArray()
    return donationRequestProcesses.map((process: any) => new DonationRequestProcess(process))
  }
  async getDonationRequestProcess(donationRequestProcessId: string) {
    let parsedDonationRequestProcessId: ObjectId
    try {
      parsedDonationRequestProcessId = new ObjectId(donationRequestProcessId)
    } catch (err) {
      return false
    }
    const donationRequestProcess = await databaseService.donationRequestProcess.findOne({
      _id: parsedDonationRequestProcessId
    })
    if (!donationRequestProcess) {
      return null
    }
    return new DonationRequestProcess(donationRequestProcess)
  }

  async deleteDonationRequestProcess(id: string) {
    let parsedId: ObjectId
    try {
      parsedId = new ObjectId(id)
    } catch (err) {
      return false
    }
    const deletedProcess = await databaseService.donationRequestProcess.findOneAndDelete({ _id: parsedId })
    if (!deletedProcess) {
      return null
    }
    return new DonationRequestProcess(deletedProcess)
  }
}

const donationService = new DonationService()
export default donationService
