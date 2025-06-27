import { ParamsDictionary } from 'express-serve-static-core'
import {
  RequestProcessBloodStatus,
  RequestProcessDetailStatus,
  RequestProcessStatus,
  RequestRegistrationStatus
} from '~/constants/enum'
export interface CreateRequestRegistrationReqBody {
  citizen_id_number: string
  blood_group_id?: string
  blood_component_ids?: string[]
  receive_date_request: Date
  is_emergency: boolean
  image?: string
  full_name?: string
  phone?: string
  note?: string
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

export interface GetRequestRegistrationIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetRequestProcessIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateRequestProcessIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateRequestProcessIdReqBody {
  is_emergency: boolean
  blood_component_ids?: string[]
  blood_group_id?: string
  volume_received?: number
  status: RequestProcessStatus
  description?: string
  request_date?: Date
}

export interface GetRequestProcessDetailIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateRequestProcessDetailIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateRequestProcessDetailIdReqBody {
  volume_required: number
  status: RequestProcessDetailStatus
  blood_component_id?: string
}

export interface GetRequestProcessBloodIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateRequestProcessBloodIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateRequestProcessBloodIdReqBody {
  status: RequestProcessBloodStatus
  blood_component_id: string
}

export interface GetRequestHealthProcessByRequestIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetStatusRequestHealthProcessByRequestIdReqParams extends ParamsDictionary {
  id: string
}
