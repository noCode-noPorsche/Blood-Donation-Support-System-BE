import { ParamsDictionary } from 'express-serve-static-core'

export interface MarkNotificationAsReadReqParams extends ParamsDictionary {
  id: string
}
