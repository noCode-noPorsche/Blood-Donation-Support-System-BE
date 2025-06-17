import { ObjectId } from 'mongodb'
import { DonationRequestProcessStatus } from '~/constants/enum'

interface DonationRequestProcessType {
  _id?: ObjectId
  user_id: ObjectId
  donation_registration_id?: ObjectId
  health_check_id?: ObjectId
  volume_collected?: number
  status: DonationRequestProcessStatus
  donation_date?: Date
  description?: string
  created_at: Date
  updated_at: Date
}
export default class DonationRequestProcess {
  _id?: ObjectId
  user_id: ObjectId
  donation_registration_id?: ObjectId
  health_check_id?: ObjectId
  volume_collected?: number
  status: DonationRequestProcessStatus
  donation_date?: Date
  created_at: Date
  updated_at: Date
  description?: string
  constructor(donationRequestProcess: DonationRequestProcessType) {
    const date = new Date()
    this._id = donationRequestProcess._id || new ObjectId()
    this.user_id = donationRequestProcess.user_id
    this.donation_registration_id = donationRequestProcess.donation_registration_id
    this.health_check_id = donationRequestProcess.health_check_id || new ObjectId()
    this.volume_collected = donationRequestProcess.volume_collected
    this.status = donationRequestProcess.status || DonationRequestProcessStatus.Pending
    this.donation_date = donationRequestProcess.donation_date || date
    this.created_at = donationRequestProcess.created_at || date
    this.updated_at = donationRequestProcess.updated_at || date
    this.description = donationRequestProcess.description || ''
  }
}
