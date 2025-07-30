import { Request, Response } from 'express'
import { BLOOD_MESSAGES } from '~/constants/messages'
import { UpdateBlogByIdReqParams } from '~/models/requests/Blog.requests'
import { UpdateBloodInventoryThresholdReqBody } from '~/models/requests/BloodInventoryThreshold.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bloodInventoryThresholdService from '~/services/bloodInventoryThreshold.services'

export const getAllBloodInventoryThresholdController = async (req: Request, res: Response) => {
  const result = await bloodInventoryThresholdService.getAllBloodInventoryThreshold()

  res.json({
    message: BLOOD_MESSAGES.GET_BLOOD_INVENTORY_THRESHOLD_SUCCESS,
    result: result
  })
}

export const updateBloodInventoryThresholdByIdController = async (
  req: Request<UpdateBlogByIdReqParams, any, UpdateBloodInventoryThresholdReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req
  const result = await bloodInventoryThresholdService.updateBloodInventoryThresholdById({ user_id, id, payload: body })

  res.json({
    message: BLOOD_MESSAGES.GET_BLOOD_INVENTORY_THRESHOLD_SUCCESS,
    result: result
  })
}
