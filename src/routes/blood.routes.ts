import express from 'express'
import {
  createBloodComponentController,
  createBloodGroupController,
  getBloodComponentsController,
  getBloodGroupsController
} from '~/controllers/blood.controllers'
import { createBloodComponentValidator, createBloodGroupValidator } from '~/middlewares/blood.middlewares'
import { isAdminValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const bloodRouter = express.Router()

/**
 * Description. Get all blood groups
 * Path: /blood-groups
 * METHOD: GET
 */
bloodRouter.get('/blood-groups', wrapAsync(getBloodGroupsController))

/**
 * Description. Create a new blood group (only admin)
 * Path: /blood-groups
 * METHOD: POST
 * Body : { name: BloodGroup }
 */
bloodRouter.post('/blood-groups', isAdminValidator, createBloodGroupValidator, wrapAsync(createBloodGroupController))

/**
 * Description. Get all blood components
 * Path: /blood-components
 * METHOD: GET
 */
bloodRouter.get('/blood-components', wrapAsync(getBloodComponentsController))

/**
 * Description. Create a new blood component (only admin)
 * Path: /blood-components
 * METHOD: POST
 * Body : { name: BloodComponent }
 */
bloodRouter.post(
  '/blood-components',
  isAdminValidator,
  createBloodComponentValidator,
  wrapAsync(createBloodComponentController)
)

export default bloodRouter
