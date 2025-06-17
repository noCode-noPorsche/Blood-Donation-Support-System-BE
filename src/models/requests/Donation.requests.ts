import { ParamsDictionary } from 'express-serve-static-core'
import { DonationRegisterStatus, DonationProcessStatus } from '~/constants/enum'
export interface RegisterDonationReqBody {
  blood_group_id?: string
  blood_component_id?: string
  start_date_donation: string
}

export interface GetDonationRegisterReqParams extends ParamsDictionary {
  user_id: string
}

export interface UpdateDonationRegistrationReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateStatusDonationRegistrationReqBody {
  status: DonationRegisterStatus
}

export interface UpdateDonationRegistrationReqBody {
  blood_group_id: string
  blood_component_id: string
  start_date_donation: Date
}

export interface UpdateDonationProcessReqBody {
  blood_group_id: string
  volume_collected: number
  description: string
  donation_date: Date
  status: DonationProcessStatus
}

export interface UpdateDonationProcessReqParams extends ParamsDictionary {
  id: string
}
