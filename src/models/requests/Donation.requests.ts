import { ParamsDictionary } from 'express-serve-static-core'
import { DonationProcessStatus, DonationRegistrationStatus } from '~/constants/enum'
export interface DonationRegistrationReqBody {
  blood_group_id?: string
  blood_component_id?: string
  start_date_donation: string
}

export interface GetDonationRegistrationReqParams extends ParamsDictionary {
  user_id: string
}

export interface UpdateDonationRegistrationReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateDonationRegistrationReqBody {
  blood_group_id: string
  blood_component_id: string
  start_date_donation: Date
  status: DonationRegistrationStatus
}

export interface GetDonationRegistrationReqParams extends ParamsDictionary {
  id: string
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
