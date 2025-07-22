import express from 'express'
import { findCompatibleDonorsNearby } from '~/controllers/location.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { isAdminValidator } from '~/middlewares/user.middlewares'
import { FindCompatibleDonorsReqBody } from '~/models/requests/Location.requests'
import { wrapAsync } from '~/utils/handler'

const locationRouter = express.Router()

/**
 * Description. Find donors nearby based on radius and blood group
 * Path: /find-compatible-donors
 * Method: POST
 * Body: { FindCompatibleDonorsReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
locationRouter.post(
  '/find-compatible-donors',
  isAdminValidator,
  filterMiddleware<FindCompatibleDonorsReqBody>(['blood_group_name', 'radiusKm']),
  wrapAsync(findCompatibleDonorsNearby)
)

export default locationRouter
