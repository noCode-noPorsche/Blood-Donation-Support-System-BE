import { ParamsDictionary, Query } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { BloodUnitStatus, DonationType } from '~/constants/enum'
import { Pagination } from '~/models/requests/Pagination.requests'

export interface CreateBloodUnitsReqBody {
  blood_group_id: string
  blood_component_id: string
  volume: number
}

export interface UpdateBloodUnitsFromDonationReqBody {
  blood_group_id: string
  blood_component_id: string
  status: BloodUnitStatus
  volume: number
  note?: string
  storage_temperature?: number
}

export interface UpdateBloodUnitsByDonationProcessIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetBloodUnitsByDonationProcessIdReqParams extends ParamsDictionary {
  id: string
}
export interface UpdateStatusBloodUnitsReqBody {
  status: BloodUnitStatus
}

export interface UpdateStatusBloodUnitsIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetBloodUnitsByDonationProcessIdQuery extends Query, Pagination {
  status: BloodUnitStatus
  blood_component_id: string
}

export interface GetAllBloodUnitsQuery extends Query, Pagination {
  status: BloodUnitStatus
  blood_component_id: string
  blood_group_id: string
  volume: string
}

export interface GetAllBloodUnitsRelativeReqParams extends ParamsDictionary {
  blood_group_id: string
  blood_component_ids: string
}

export interface GetAllBloodUnitsRelativeQuery extends Query, Pagination {
  volume: string
}

export interface BloodUnitsFilter {
  status?: BloodUnitStatus
  donation_type?: DonationType
  blood_component_id?: ObjectId
  blood_group_id?: ObjectId
  volume?: number
}
