import express from 'express'
import {
  getAllBloodInventoryThresholdController,
  updateBloodInventoryThresholdByIdController
} from '~/controllers/bloodInventoryThreshold.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { UpdateBloodInventoryThresholdReqBody } from '~/models/requests/BloodInventoryThreshold.requests'
import { wrapAsync } from '~/utils/handler'

const bloodInventoryThreshold = express.Router()

/**
 * Description. Get all blood inventory threshold for Admin
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
bloodInventoryThreshold.get('/', isStaffOrAdminValidator, wrapAsync(getAllBloodInventoryThresholdController))

/**
 * Description. Update blood inventory threshold by id for Admin
 * Path: /:id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token>}
 * Body: { UpdateBloodInventoryThresholdReqBody }
 */
bloodInventoryThreshold.patch(
  '/:id',
  isStaffOrAdminValidator,
  filterMiddleware<UpdateBloodInventoryThresholdReqBody>(['threshold_unit_stable']),
  wrapAsync(updateBloodInventoryThresholdByIdController)
)

export default bloodInventoryThreshold
