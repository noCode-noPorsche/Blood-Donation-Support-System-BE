import { Request, Response } from 'express'
import bloodService from '~/services/blood.services'

export const getBloodGroupsController = async (req: Request, res: Response) => {
  const bloodGroups = await bloodService.getBloodGroups()
  res.json(bloodGroups)
}

export const createBloodGroupController = async (req: Request, res: Response) => {
  const { name } = req.body
  const bloodGroup = await bloodService.createBloodGroup(name)
  res.json(bloodGroup)
}
