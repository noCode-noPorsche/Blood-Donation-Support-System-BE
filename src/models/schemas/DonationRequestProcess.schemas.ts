import { ObjectId } from 'mongodb'
import { DonationRequestProcessStatus } from '~/constants/enum'

interface DonationRequestProcessType {
  _id?: ObjectId
  user_id: ObjectId
  donation_registration_id?: ObjectId
  volume_collected?: number
  status: DonationRequestProcessStatus
  donation_date?: Date
  created_date: Date
  updated_date: Date
  description?: string
}
export default class DonationRequestProcess {
  _id?: ObjectId
  user_id: ObjectId
  donation_registration_id?: ObjectId
  volume_collected?: number
  status: DonationRequestProcessStatus
  donation_date?: Date
  created_date: Date
  updated_date: Date
  description?: string
  constructor(donationRequestProcess: DonationRequestProcessType) {
    const date = new Date()
    this._id = donationRequestProcess._id || new ObjectId()
    this.user_id = donationRequestProcess.user_id
    this.donation_registration_id = donationRequestProcess.donation_registration_id
    this.volume_collected = donationRequestProcess.volume_collected
    this.status = donationRequestProcess.status || DonationRequestProcessStatus.Pending
    this.donation_date = donationRequestProcess.donation_date || date
    this.created_date = donationRequestProcess.created_date || date
    this.updated_date = donationRequestProcess.updated_date || date
    this.description = donationRequestProcess.description || ''
  }
}
