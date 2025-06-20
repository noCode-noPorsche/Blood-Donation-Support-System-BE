import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { REQUEST_MESSAGES } from '~/constants/messages'
import {
  CreateRequestRegistrationReqBody,
  UpdateRequestRegistrationIdReqParams,
  UpdateRequestRegistrationReqBody
} from '~/models/requests/Request.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import requestsService from '~/services/request.services'

export const createRequestRegistrationController = async (
  req: Request<ParamsDictionary, any, CreateRequestRegistrationReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const result = await requestsService.createRequestRegistration({ user_id, payload: body })
  res.json({
    message: REQUEST_MESSAGES.CREATE_REQUEST_REGISTRATION_SUCCESS,
    result: result
  })
}

export const updateRequestRegistrationController = async (
  req: Request<UpdateRequestRegistrationIdReqParams, any, UpdateRequestRegistrationReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const result = await requestsService.updateRequestRegistration({ id, user_id, payload: body })
  res.json({
    message: REQUEST_MESSAGES.UPDATE_REQUEST_REGISTRATION_SUCCESS,
    result: result
  })
}
