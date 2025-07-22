import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BloodGroupEnum } from '~/constants/enum'
import { LOCATION_MESSAGES } from '~/constants/messages'
import { FindCompatibleDonorsReqBody } from '~/models/requests/Location.requests'
import locationService from '~/services/location.services'

export const findCompatibleDonorsNearby = async (
  req: Request<ParamsDictionary, any, FindCompatibleDonorsReqBody>,
  res: Response
) => {
  const { radiusKm, blood_group_name } = req.body

  const result = await locationService.findCompatibleDonorsNearby({
    radiusKm,
    blood_group_name: blood_group_name as BloodGroupEnum
  })

  res.json({
    message: LOCATION_MESSAGES.FIND_COMPATIBLE_DONORS_NEARBY_SUCCESS,
    result
  })
}
