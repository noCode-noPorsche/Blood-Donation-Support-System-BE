import { ParamsDictionary } from 'express-serve-static-core'
import { HealthCheckStatus, UnderlyingHealthCondition } from '~/constants/enum'

export interface UpdateHealthCheckReqBody {
  blood_group_id?: string
  blood_component_ids?: string[]
  weight?: number
  temperature?: number
  heart_rate?: number
  diastolic_blood_pressure?: number
  systolic_blood_pressure?: number
  hemoglobin?: number
  underlying_health_condition?: UnderlyingHealthCondition[]
  status: HealthCheckStatus
  description?: string
}

export interface UpdateHealthCheckReqParams extends ParamsDictionary {
  id: string
}

export interface GetHealthCheckReqParams extends ParamsDictionary {
  id: string
}
