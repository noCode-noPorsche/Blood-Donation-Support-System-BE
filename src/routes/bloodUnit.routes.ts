import express from 'express'
import {
  createBloodUnitsController,
  getAllBloodUnitsController,
  getBloodUnitByDonationProcessIdController,
  updateBloodUnitsController
} from '~/controllers/bloodUnit.controllers'
import { isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const bloodUnitRouter = express.Router()

/**
 * Description. Create a new blood unit
 * Path: /
 * Method: POST
 * Body: { CreateBloodUnitsReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.post('/', isStaffOrAdminValidator, wrapAsync(createBloodUnitsController))

/**
 * Description. Update blood units by donation process id
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
 * Description. Get blood unit by donation process id
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.get('/:id', isStaffOrAdminValidator, wrapAsync(getBloodUnitByDonationProcessIdController))

/**
 * Description. Get all blood unit
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
bloodUnitRouter.get('/', isStaffOrAdminValidator, wrapAsync(getAllBloodUnitsController))

export default bloodUnitRouter
