import { BloodComponentEnum, BloodGroupEnum } from '~/constants/enum'

export interface CreateBloodGroupReqBody {
  name: BloodGroupEnum
}

export interface CreateBloodComponentReqBody {
  name: BloodComponentEnum
}
