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
  const healthChecks = await healthCheckService.getAllHealthChecks()
  res.json({
    message: HEALTH_CHECK_MESSAGES.GET_ALL_HEALTH_CHECKS_SUCCESS,
    result: healthChecks
  })
}

export const getHealthCheckByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const healthCheck = await healthCheckService.getHealthCheckByUserId(user_id)
  res.json({
    message: HEALTH_CHECK_MESSAGES.GET_HEALTH_CHECK_BY_USER_ID_SUCCESS,
    result: healthCheck
  })
}

export const getHealthCheckByIdController = async (req: Request<GetHealthCheckReqParams, any, any>, res: Response) => {
  const { id } = req.params
  const healthCheck = await healthCheckService.getHealthCheckById(id)
  res.json({
    message: HEALTH_CHECK_MESSAGES.GET_HEALTH_CHECK_SUCCESS,
    result: healthCheck
  })
}

export const updateHealthCheckByIdController = async (
  req: Request<UpdateHealthCheckReqParams, any, UpdateHealthCheckReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { body } = req
  const { user_id } = req.decode_authorization as TokenPayload
  const updatedHealthCheck = await healthCheckService.updateHealthCheckById({ user_id, id, payload: body })
  res.json({
    message: HEALTH_CHECK_MESSAGES.UPDATE_HEALTH_CHECK_SUCCESS,
    result: updatedHealthCheck
  })
}
