import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BLOOD_MESSAGES } from '~/constants/messages'
import { CreateBloodComponentReqBody, CreateBloodGroupReqBody } from '~/models/requests/Blood.requests'
import bloodService from '~/services/blood.services'

export const getBloodGroupsController = async (req: Request, res: Response) => {
  const result = await bloodService.getBloodGroups()
  res.sendSuccess?.(BLOOD_MESSAGES.GET_BLOOD_GROUPS_SUCCESS, result)
}

export const createBloodGroupController = async (
  req: Request<ParamsDictionary, any, CreateBloodGroupReqBody>,
  res: Response
) => {
  const { name } = req.body

  const result = await bloodService.createBloodGroup(name)
  res.sendSuccess?.(BLOOD_MESSAGES.CREATE_BLOOD_GROUP_SUCCESS, { result })
}

export const getBloodComponentsController = async (req: Request, res: Response) => {
  const result = await bloodService.getBloodComponents()
  res.sendSuccess?.(BLOOD_MESSAGES.GET_BLOOD_COMPONENTS_SUCCESS, result)
}

export const createBloodComponentController = async (
  req: Request<ParamsDictionary, any, CreateBloodComponentReqBody>,
  res: Response
) => {
  const { name } = req.body

  const result = await bloodService.createBloodComponent(name)
  res.sendSuccess?.(BLOOD_MESSAGES.CREATE_BLOOD_COMPONENT_SUCCESS, { result })
}
