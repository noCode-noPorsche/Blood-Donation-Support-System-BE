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
}

export interface UpdateBloodUnitsByDonationProcessIdReqParams extends ParamsDictionary {
  id: string
}

export interface GetBloodUnitsByDonationProcessIdReqParams extends ParamsDictionary {
  id: string
}
