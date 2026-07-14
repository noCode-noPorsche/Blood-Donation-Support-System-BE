import { ParamsDictionary, Query } from 'express-serve-static-core'
import { DonationProcessStatus, DonationRegistrationStatus, DonationType } from '~/constants/enum'
import { Pagination } from '~/models/requests/Pagination.requests'
export interface CreateDonationRegistrationReqBody {
  blood_group_id?: string
  donation_type: DonationType
  start_date_donation: string
  answers: {
    question_id: string
    answer: boolean
  }[]
  citizen_id_number?: string
  full_name?: string
  phone?: string
  gender?: string
  date_of_birth?: string
}

export interface UpdateDonationRegistrationIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateDonationRegistrationReqBody {
  blood_group_id?: string
  start_date_donation?: string
  status: DonationRegistrationStatus
  donation_type?: DonationType
  token?: string
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

export interface GetAllDonationRegistrationQuery extends Query, Pagination {
  donation_type: string
}

export interface GetDonationRegistrationByUserIdQuery extends Query, Pagination {
  donation_type: string
}
