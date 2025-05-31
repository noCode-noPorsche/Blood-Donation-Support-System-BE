import { ObjectId } from 'mongodb'
import { DonationRegisterStatus } from '~/constants/enum'

interface DonationRegisterType {
  _id?: ObjectId
  user_id: ObjectId
  donation_request_process_id?: ObjectId
  status: DonationRegisterStatus
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  created_date: Date
  updated_date: Date
  start_date_donation: Date
}

export default class DonationRegister {
  _id?: ObjectId
  user_id: ObjectId
  donation_request_process_id?: ObjectId
  status: DonationRegisterStatus
  blood_group_id: ObjectId
  blood_component_id: ObjectId
  created_date: Date
  updated_date: Date
  start_date_donation: Date
  constructor(donationRegister: DonationRegisterType) {
    const date = new Date()
    this._id = donationRegister._id || new ObjectId()
    this.user_id = donationRegister.user_id
    this.donation_request_process_id = donationRegister.donation_request_process_id || new ObjectId()
    this.status = donationRegister.status || DonationRegisterStatus.Pending
    this.blood_group_id = donationRegister.blood_group_id
    this.blood_component_id = donationRegister.blood_component_id
    this.created_date = donationRegister.created_date || date
    this.updated_date = donationRegister.updated_date || date
    this.start_date_donation = donationRegister.start_date_donation || date
  }
}
