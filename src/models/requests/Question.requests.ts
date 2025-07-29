import { ParamsDictionary } from 'express-serve-static-core'
export interface CreateQuestionReqBody {
  name: string
}

export interface DeleteQuestionIdReqParams extends ParamsDictionary {
  id: string
}
