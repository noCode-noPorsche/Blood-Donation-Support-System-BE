import { ObjectId } from 'mongodb'
import { DonationRegistrationStatus } from '~/constants/enum'

interface DonationRegistrationType {
  _id?: ObjectId
  user_id: ObjectId
  donation_process_id?: ObjectId
  health_check_id?: ObjectId
  status: DonationRegistrationStatus
  blood_group_id: ObjectId | null
  blood_component_id: ObjectId
  created_at: Date
  updated_at: Date
  start_date_donation: Date
}

export default class DonationRegistration {
  _id?: ObjectId
  user_id: ObjectId
  donation_process_id?: ObjectId
  health_check_id?: ObjectId
  status: DonationRegistrationStatus
  blood_group_id: ObjectId | null
  blood_component_id: ObjectId | null
  created_at: Date
  updated_at: Date
  start_date_donation: Date
  constructor(donationRegistration: DonationRegistrationType) {
    const date = new Date()
    this._id = donationRegistration._id || new ObjectId()
    this.user_id = donationRegistration.user_id
    this.donation_process_id = donationRegistration.donation_process_id || new ObjectId()
    this.health_check_id = donationRegistration.health_check_id || new ObjectId()
    this.status = donationRegistration.status || DonationRegistrationStatus.Pending
    this.blood_group_id = donationRegistration.blood_group_id || null
    this.blood_component_id = donationRegistration.blood_component_id || null
    this.created_at = donationRegistration.created_at || date
    this.updated_at = donationRegistration.updated_at || date
    this.start_date_donation = donationRegistration.start_date_donation || date
  }
}
