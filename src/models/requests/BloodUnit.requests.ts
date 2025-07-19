import { ParamsDictionary } from 'express-serve-static-core'
import { BloodUnitStatus } from '~/constants/enum'

export interface CreateBloodUnitsReqBody {
  blood_group_id: string
  blood_component_id: string
  volume: number
}

export interface UpdateBloodUnitsReqBody {
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

export interface UpdateStatusBloodUnitsIdReqPảrams extends ParamsDictionary {
  id: string
}
