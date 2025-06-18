import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BLOOD_MESSAGES } from '~/constants/messages'
import { CreateBloodComponentReqBody, CreateBloodGroupReqBody } from '~/models/requests/Blood.requests'
import bloodService from '~/services/blood.services'

export const getBloodGroupsController = async (req: Request, res: Response) => {
  const bloodGroups = await bloodService.getBloodGroups()
  res.json({
    message: BLOOD_MESSAGES.GET_BLOOD_GROUPS_SUCCESS,
    result: bloodGroups
  })
}

export const createBloodGroupController = async (
  req: Request<ParamsDictionary, any, CreateBloodGroupReqBody>,
  res: Response
) => {
  const { name } = req.body
  const bloodGroup = await bloodService.createBloodGroup(name)
  res.json(bloodGroup)
}

export const getBloodComponentsController = async (req: Request, res: Response) => {
  const bloodComponents = await bloodService.getBloodComponents()
  res.json({
    message: BLOOD_MESSAGES.GET_BLOOD_COMPONENTS_SUCCESS,
    result: bloodComponents
  })
}

export const createBloodComponentController = async (
  req: Request<ParamsDictionary, any, CreateBloodComponentReqBody>,
  res: Response
) => {
  const { name } = req.body
  const bloodComponent = await bloodService.createBloodComponent(name)
  res.json(bloodComponent)
}
