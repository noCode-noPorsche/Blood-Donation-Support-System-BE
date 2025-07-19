import { ParamsDictionary } from 'express-serve-static-core'
import { DonationProcessStatus, DonationRegistrationStatus, DonationType } from '~/constants/enum'
export interface CreateDonationRegistrationReqBody {
  blood_group_id?: string
  donation_type: DonationType
  start_date_donation: string
}

export interface UpdateDonationRegistrationIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateDonationRegistrationReqBody {
  blood_group_id?: string
  start_date_donation?: string
  status: DonationRegistrationStatus
  donation_type?: DonationType
}

export interface GetDonationRegistrationIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetDonationProcessIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateDonationProcessReqBody {
  volume_collected: number
  description?: string
  donation_date?: string
  status: DonationProcessStatus
}

export interface UpdateDonationProcessReqParams extends ParamsDictionary {
  id: string
}

export interface GetDonationHealthProcessByDonationIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetStatusDonationHealthProcessByDonationIdReqParams extends ParamsDictionary {
  id: string
}
