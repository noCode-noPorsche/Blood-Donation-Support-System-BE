import { ParamsDictionary } from 'express-serve-static-core'
import { DonationRegisterStatus, DonationRequestProcessStatus } from '~/constants/enum'
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

export interface UpdateStatusDonationRequestProcessReqBody {
  status: DonationRequestProcessStatus
}

export interface UpdateStatusDonationRequestProcessReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateDonationRequestProcessReqBody {
  volume_collected: number
  description: string
  donation_date: Date
  status: DonationRequestProcessStatus
}

export interface UpdateDonationRequestProcessReqParams extends ParamsDictionary {
  id: string
}

export interface GetDonationRequestProcessesReqParams extends ParamsDictionary {
  user_id: string
}
