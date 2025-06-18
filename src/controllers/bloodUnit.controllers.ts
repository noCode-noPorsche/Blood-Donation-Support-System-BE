import { Request, Response } from 'express'
import { BLOOD_MESSAGES } from '~/constants/messages'
import {
  GetBloodUnitsByDonationProcessIdReqParams,
  UpdateBloodUnitsByDonationProcessIdReqParams,
  UpdateBloodUnitsReqBody
} from '~/models/requests/BloodUnit.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bloodService from '~/services/blood.services'
import bloodUnitService from '~/services/bloodUnit.services'

export const createBloodUnitsController = async (req: Request, res: Response) => {}

export const updateBloodUnitsController = async (
  req: Request<UpdateBloodUnitsByDonationProcessIdReqParams, any, UpdateBloodUnitsReqBody[]>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req
  const updateBloodUnits = await bloodUnitService.updateBloodUnitsFromDonation({ id, payload: body, user_id })
  res.json({
    message: BLOOD_MESSAGES.UPDATE_BLOOD_UNITS_SUCCESS,
    result: updateBloodUnits
  })
}

export const getBloodUnitByDonationProcessIdController = async (
  req: Request<GetBloodUnitsByDonationProcessIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const bloodUnits = await bloodUnitService.getBloodUnitsByDonationProcessId(id)
  res.json({
    message: BLOOD_MESSAGES.GET_BLOOD_UNITS_SUCCESS,
    result: bloodUnits
  })
}

export const getAllBloodUnitsController = async (req: Request, res: Response) => {
  const bloodUnits = await bloodUnitService.getAllBloodUnits()
  res.json({
    message: BLOOD_MESSAGES.GET_BLOOD_UNITS_SUCCESS,
    result: bloodUnits
  })
}
