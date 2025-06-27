import express from 'express'
import {
  createDonationRegistrationController,
  getAllDonationHealthProcessByUserIdController,
  // deleteDonationRegistrationController,
  getAllDonationProcessesController,
  getAllDonationRegistrationsController,
  getDonationHealthProcessByDonationIdController,
  getDonationProcessByUserIdController,
  getDonationProcessesByIdController,
  getDonationRegistrationByIdController,
  getDonationRegistrationByUserIdController,
  updateDonationProcessController,
  updateDonationRegistrationController
} from '~/controllers/donation.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  createDonationValidator,
  updateDonationProcessValidator,
  updateDonationRegistrationValidator
} from '~/middlewares/donation.middlewares'
import { accessTokenValidator, isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { UpdateDonationProcessReqBody, UpdateDonationRegistrationReqBody } from '~/models/requests/Donation.requests'

import { wrapAsync } from '~/utils/handler'

const donationRouter = express.Router()

//Donation - Health - Process
/**
 * Description. Get all donation registrations - health check - donation process for user now
 * Path: /donation-health-processes/user
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.get(
  '/donation-health-process/user',
  accessTokenValidator,
  wrapAsync(getAllDonationHealthProcessByUserIdController)
)

/**
 * Description. Get all donation registrations - health check - donation process by id
 * Path: /donation-health-processes/user
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.get(
  '/donation-health-process/:id',
  accessTokenValidator,
  wrapAsync(getDonationHealthProcessByDonationIdController)
)

//Donation Registration
/**
 * Description. Create a new donation
 * Path: /donation-registrations
 * METHOD: POST
 * Body : { DonationRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.post(
  '/donation-registrations',
  accessTokenValidator,
  createDonationValidator,
  wrapAsync(createDonationRegistrationController)
)

/**
 * Description. Get all donation registrations for staff or admin
 * Path: /donation-registrations
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.get('/donation-registrations', isStaffOrAdminValidator, wrapAsync(getAllDonationRegistrationsController))

/**
 * Description. Get donation registration by user id
 * Path: /donation-registrations/user
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.get(
  '/donation-registrations/user',
  accessTokenValidator,
  wrapAsync(getDonationRegistrationByUserIdController)
)

/**
 * Description. Get donation registration by id
 * Path: /donation-registrations/:id
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.get(
  '/donation-registrations/:id',
  isStaffOrAdminValidator,
  wrapAsync(getDonationRegistrationByIdController)
)

/**
 * Description. Update information a donation registration for customer
 * Path: /donation-registrations/:id
 * METHOD: PATCH
 * Body : { UpdateDonationRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.patch(
  '/donation-registrations/:id',
  accessTokenValidator,
  updateDonationRegistrationValidator,
  filterMiddleware<UpdateDonationRegistrationReqBody>([
    'blood_group_id',
    'blood_component_id',
    'start_date_donation',
    'status'
  ]),
  wrapAsync(updateDonationRegistrationController)
)

//Note
/**
 * Description. Delete a donation registration
 * Path: /donation-registration/:id
 * METHOD: DELETE
 */
// donationRouter.delete(
//   '/donation-registration/:id',
//   accessTokenValidator,
//   isAdminValidator,
//   wrapAsync(deleteDonationRegistrationController)
// )

/**
 * Description. Get all donation request processes for staff or admin
 * Path: /donation-request-processes
 * METHOD: GET
 */
donationRouter.get('/donation-processes', isStaffOrAdminValidator, wrapAsync(getAllDonationProcessesController))

/**
 * Description. Get donation request processes by id for staff or admin
 * Path: /donation-request-processes/:id
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.get('/donation-processes/:id', isStaffOrAdminValidator, wrapAsync(getDonationProcessesByIdController))

/**
 * Description. Get donation process by user id
 * Path: /donation-processes/user
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 *
 */
donationRouter.get('/donation-processes/user', accessTokenValidator, wrapAsync(getDonationProcessByUserIdController))

/**
 * Description. Update a donation request process for staff or admin
 * Path: /donation-request-processes/:id
 * METHOD: PATCH
 * Body : { UpdateDonationProcessReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.patch(
  '/donation-processes/:id',
  isStaffOrAdminValidator,
  updateDonationProcessValidator,
  filterMiddleware<UpdateDonationProcessReqBody>([
    'status',
    'description',
    'donation_date',
    'volume_collected',
    'blood_group_id'
  ]),
  wrapAsync(updateDonationProcessController)
)

export default donationRouter
