import { Request, Response } from 'express'
import { HEALTH_CHECK_MESSAGES } from '~/constants/messages'
import {
  GetHealthCheckReqParams,
  UpdateHealthCheckReqBody,
  UpdateHealthCheckReqParams
} from '~/models/requests/HealthCheck.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import healthCheckService from '~/services/healthCheck.services'

export const getAllHealthChecksController = async (req: Request, res: Response) => {
  const result = await healthCheckService.getAllHealthChecks()
  res.sendSuccess?.(HEALTH_CHECK_MESSAGES.GET_ALL_HEALTH_CHECKS_SUCCESS, { result })
}

export const getHealthCheckByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await healthCheckService.getHealthCheckByUserId(user_id)
  res.sendSuccess?.(HEALTH_CHECK_MESSAGES.GET_HEALTH_CHECK_BY_USER_ID_SUCCESS, { result })
}

export const getHealthCheckByIdController = async (req: Request<GetHealthCheckReqParams, any, any>, res: Response) => {
  const { id } = req.params

  const result = await healthCheckService.getHealthCheckById(id)
  res.sendSuccess?.(HEALTH_CHECK_MESSAGES.GET_HEALTH_CHECK_SUCCESS, { result })
}

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
