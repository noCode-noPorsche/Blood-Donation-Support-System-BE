import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { REQUEST_MESSAGES } from '~/constants/messages'
import {
  CreateRequestRegistrationReqBody,
  GetRequestHealthProcessByRequestIdReqParams,
  GetRequestProcessBloodIdReqParams,
  GetRequestProcessDetailIdReqParams,
  GetRequestProcessIdReqParams,
  GetRequestRegistrationIdReqParams,
  UpdateRequestProcessBloodIdReqBody,
  UpdateRequestProcessBloodIdReqParams,
  UpdateRequestProcessDetailIdReqBody,
  UpdateRequestProcessDetailIdReqParams,
  UpdateRequestProcessIdReqBody,
  UpdateRequestProcessIdReqParams,
  UpdateRequestRegistrationIdReqParams,
  UpdateRequestRegistrationReqBody
} from '~/models/requests/Request.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import requestsService from '~/services/request.services'

//Request - Health - Process
export const getAllRequestHealthProcessByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await requestsService.getRequestHealthProcessByUserId(user_id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_REGISTRATION_BY_USER_SUCCESS,
    result: result
  })
}

export const getRequestHealthProcessByRequestIdController = async (
  req: Request<GetRequestHealthProcessByRequestIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const result = await requestsService.getRequestHealthProcessByRequestId(id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_REGISTRATION_BY_USER_SUCCESS,
    result: result
  })
}

//Request Donation
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

export const getRequestRegistrationByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await requestsService.getRequestRegistrationByUserId(user_id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_REGISTRATION_BY_USER_SUCCESS,
    result: result
  })
}

export const getAllRequestRegistrationController = async (req: Request, res: Response) => {
  const result = await requestsService.getAllRequestRegistration()
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_REGISTRATION_SUCCESS,
    result: result
  })
}

export const getRequestRegistrationByIdController = async (
  req: Request<GetRequestRegistrationIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const result = await requestsService.getRequestRegistrationById(id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_REGISTRATION_SUCCESS,
    result: result
  })
}

//Request Process
export const getRequestProcessByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await requestsService.getRequestProcessByUserId(user_id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_PROCESS_SUCCESS,
    result: result
  })
}

export const getAllRequestProcessController = async (req: Request, res: Response) => {
  const result = await requestsService.getAllRequestProcess()
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_PROCESS_SUCCESS,
    result: result
  })
}

export const getRequestProcessByIdController = async (
  req: Request<GetRequestProcessIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const result = await requestsService.getRequestProcessById(id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_PROCESS_SUCCESS,
    result: result
  })
}

export const updateRequestProcessByIdController = async (
  req: Request<UpdateRequestProcessIdReqParams, any, UpdateRequestProcessIdReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req
  const result = await requestsService.updateRequestProcessById({ id, user_id, payload: body })
  res.json({
    message: REQUEST_MESSAGES.UPDATE_REQUEST_PROCESS_SUCCESS,
    result: result
  })
}

//Request Process Detail
export const getRequestProcessDetailByProcessIdController = async (
  req: Request<GetRequestProcessDetailIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const result = await requestsService.getRequestProcessDetailByProcessId(id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_PROCESS_DETAIL_SUCCESS,
    result: result
  })
}

export const updateRequestProcessDetailByProcessIdController = async (
  req: Request<UpdateRequestProcessDetailIdReqParams, any, UpdateRequestProcessDetailIdReqBody[]>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const result = await requestsService.updateRequestProcessDetailByProcessId({ id, user_id, payload: body })
  res.json({
    message: REQUEST_MESSAGES.UPDATE_REQUEST_PROCESS_DETAIL_SUCCESS,
    result: result
  })
}

//Request Process Blood
export const getRequestProcessBloodByProcessIdController = async (
  req: Request<GetRequestProcessBloodIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const result = await requestsService.getRequestProcessBloodByProcessId(id)
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_PROCESS_BLOOD_SUCCESS,
    result: result
  })
}

export const updateRequestProcessBloodByProcessIdController = async (
  req: Request<UpdateRequestProcessBloodIdReqParams, any, UpdateRequestProcessBloodIdReqBody[]>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req
  const result = await requestsService.updateRequestProcessBloodByProcessId({ id, user_id, payload: body })
  res.json({
    message: REQUEST_MESSAGES.GET_REQUEST_PROCESS_BLOOD_SUCCESS,
    result: result
  })
}
