import { ParamsDictionary } from 'express-serve-static-core'
import {
  RequestProcessBloodStatus,
  RequestProcessDetailStatus,
  RequestProcessStatus,
  RequestRegistrationStatus,
  RequestType
} from '~/constants/enum'
export interface CreateRequestRegistrationReqBody {
  citizen_id_number: string
  blood_group_id?: string
  request_type: RequestType
  receive_date_request: string
  is_emergency: boolean
  image?: string
  full_name?: string
  phone?: string
  note?: string
  address?: string
  latitude?: number
  longitude?: number
}

export interface UpdateRequestRegistrationReqBody {
  blood_group_id?: string
  receive_date_request?: string
  request_type: RequestType
  is_emergency?: boolean
  image?: string
  status: RequestRegistrationStatus
  note?: string
  citizen_id_number?: string
  full_name?: string
  phone?: string
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
  blood_group_id?: string
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

export interface ConfirmRequestProcessBloodIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateRequestProcessBloodIdReqBody {
  status: RequestProcessBloodStatus
  blood_component_id: string
  blood_unit_id: string
}

export interface GetRequestHealthProcessByRequestIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetStatusRequestHealthProcessByRequestIdReqParams extends ParamsDictionary {
  id: string
}
