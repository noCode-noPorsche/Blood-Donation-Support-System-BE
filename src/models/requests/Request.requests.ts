import { ParamsDictionary } from 'express-serve-static-core'
import { RequestRegistrationStatus } from '~/constants/enum'
export interface CreateRequestRegistrationReqBody {
  citizen_id_number: string
  blood_group_id: string
  blood_component_id: string
  receive_date_request: Date
  is_emergency: boolean
  image?: string
  full_name?: string
  phone?: string
}

export interface UpdateRequestRegistrationReqBody {
  blood_group_id?: string
  blood_component_id?: string
  receive_date_request: Date
  is_emergency: boolean
  image?: string
  citizen_id_number?: string
  full_name?: string
  phone?: string
  status: RequestRegistrationStatus
}

export interface UpdateRequestRegistrationIdReqParams extends ParamsDictionary {
  id: string
}
