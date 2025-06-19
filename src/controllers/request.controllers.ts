import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { REQUEST_MESSAGES } from '~/constants/messages'
import { CreateRequestRegistrationReqBody } from '~/models/requests/Request.requests'
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
