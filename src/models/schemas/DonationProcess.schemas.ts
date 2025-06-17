import { ObjectId } from 'mongodb'
import { DonationProcessStatus } from '~/constants/enum'

interface DonationProcessType {
  _id?: ObjectId
  user_id: ObjectId
  donation_registration_id?: ObjectId
  health_check_id?: ObjectId
  volume_collected?: number
  status: DonationProcessStatus
  donation_date?: Date
  description?: string
  created_at: Date
  updated_at: Date
}
export default class DonationProcess {
  _id?: ObjectId
  user_id: ObjectId
  donation_registration_id?: ObjectId
  health_check_id?: ObjectId
  volume_collected?: number
  status: DonationProcessStatus
  donation_date?: Date
  created_at: Date
  updated_at: Date
  description?: string
  constructor(donationProcess: DonationProcessType) {
    const date = new Date()
    this._id = donationProcess._id || new ObjectId()
    this.user_id = donationProcess.user_id
    this.donation_registration_id = donationProcess.donation_registration_id
    this.health_check_id = donationProcess.health_check_id || new ObjectId()
    this.volume_collected = donationProcess.volume_collected
    this.status = donationProcess.status || DonationProcessStatus.Pending
    this.donation_date = donationProcess.donation_date || date
    this.created_at = donationProcess.created_at || date
    this.updated_at = donationProcess.updated_at || date
    this.description = donationProcess.description || ''
  }
}
