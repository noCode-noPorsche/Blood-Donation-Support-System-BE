import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { HEALTH_CHECK_MESSAGES } from '~/constants/messages'
import {
  GetAllHealthCheckQuery,
  GetHealthCheckByIdReqParams,
  GetHealthCheckByUserIdQuery,
  UpdateHealthCheckReqBody,
  UpdateHealthCheckReqParams
} from '~/models/requests/HealthCheck.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import healthCheckService from '~/services/healthCheck.services'

// Lấy danh sách Health Check
export const getAllHealthChecksController = async (
  req: Request<ParamsDictionary, any, any, GetAllHealthCheckQuery>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await healthCheckService.getAllHealthChecks({ page, limit })
  res.sendSuccess?.(HEALTH_CHECK_MESSAGES.GET_ALL_HEALTH_CHECKS_SUCCESS, { ...result })
}

// Lấy danh sách Health Check By User Id
export const getHealthCheckByUserIdController = async (
  req: Request<ParamsDictionary, any, any, GetHealthCheckByUserIdQuery>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await healthCheckService.getHealthCheckByUserId({ page, limit, user_id })
  res.sendSuccess?.(HEALTH_CHECK_MESSAGES.GET_HEALTH_CHECK_BY_USER_ID_SUCCESS, { result })
}

// Lấy danh sách Health Check By Id
export const getHealthCheckByIdController = async (
  req: Request<GetHealthCheckByIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params

  const result = await healthCheckService.getHealthCheckById(id)
  res.sendSuccess?.(HEALTH_CHECK_MESSAGES.GET_HEALTH_CHECK_SUCCESS, { ...result })
}

// Cập nhật Health Check
export const updateHealthCheckByIdController = async (
  req: Request<UpdateHealthCheckReqParams, any, UpdateHealthCheckReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { body } = req
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await healthCheckService.updateHealthCheckById({ user_id, id, payload: body })
  res.sendSuccess?.(HEALTH_CHECK_MESSAGES.UPDATE_HEALTH_CHECK_SUCCESS, { result })
}
