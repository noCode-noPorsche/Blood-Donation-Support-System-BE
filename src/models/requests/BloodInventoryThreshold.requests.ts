import { ParamsDictionary } from 'express-serve-static-core'

export interface UpdateBloodInventoryThresholdReqBody {
  threshold_unit_stable: number
}

export interface UpdateBloodInventoryThresholdByIdReqParams extends ParamsDictionary {
  id: string
}
