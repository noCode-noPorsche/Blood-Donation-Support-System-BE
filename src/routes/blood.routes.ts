import express from 'express'
import { createBloodGroupController, getBloodGroupsController } from '~/controllers/blood.controllers'
import { wrapAsync } from '~/utils/handler'

const bloodRouter = express.Router()

/**
 * Description. Get all blood groups
 * Path: /blood-groups
 * METHOD: GET
 */
bloodRouter.get('/blood-groups', wrapAsync(getBloodGroupsController))

/**
 * Description. Create a new blood group
 * Path: /blood-groups
 * METHOD: POST
 * Body : { name: BloodGroup }
 */
bloodRouter.post('/blood-groups', wrapAsync(createBloodGroupController))

export default bloodRouter
