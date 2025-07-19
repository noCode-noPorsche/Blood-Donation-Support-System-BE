import express from 'express'
import {
  getAllBloodUnitsController,
  getAllBloodUnitsRelativeController,
  getBloodUnitByDonationProcessIdController,
  updateBloodUnitsController,
  updateStatusBloodUnitsController
} from '~/controllers/bloodUnit.controllers'
import { updateStatusBloodUnitsValidation } from '~/middlewares/bloodUnit.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { UpdateStatusBloodUnitsReqBody } from '~/models/requests/BloodUnit.requests'
import { wrapAsync } from '~/utils/handler'

const bloodUnitRouter = express.Router()

/**
 * Description. Update blood units by donation process id for staff or admin
 * Path: /:id
 * Method: PATCH
 * Body: { UpdateBloodUnitsReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.patch(
  '/:id',
  isStaffOrAdminValidator,
  //   updateBloodUnitsValidation,
  //   filterMiddleware<UpdateBloodUnitsReqBody>(['blood_component_id', 'blood_group_id', 'status', 'volume']),
  wrapAsync(updateBloodUnitsController)
)

/**
 * Description. Update status blood units id for staff or admin
 * Path: /:id/status
 * Method: PATCH
 * Body: { UpdateStatusBloodUnitsReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.patch(
  '/:id/status',
  isStaffOrAdminValidator,
  updateStatusBloodUnitsValidation,
  filterMiddleware<UpdateStatusBloodUnitsReqBody>(['status']),
  wrapAsync(updateStatusBloodUnitsController)
)

/**
 * Description. Get blood unit by donation process id for staff or admin
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.get('/:id', isStaffOrAdminValidator, wrapAsync(getBloodUnitByDonationProcessIdController))

/**
 * Description. Get all blood unit for staff or admin
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.get('/', isStaffOrAdminValidator, wrapAsync(getAllBloodUnitsController))

/**
 * Description. Get all blood unit relative to blood group and blood component ids for staff or admin
 * Path: /blood_group_id/:blood_component_ids
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.get(
  '/:blood_group_id/:blood_component_ids',
  isStaffOrAdminValidator,
  wrapAsync(getAllBloodUnitsRelativeController)
)

export default bloodUnitRouter
