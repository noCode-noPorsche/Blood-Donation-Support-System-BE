import express from 'express'
import {
  createDonationRegistrationController,
  // deleteDonationRegistrationController,
  getAllDonationProcessesController,
  getAllDonationRegistrationsController,
  getDonationProcessesController,
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
import { accessTokenValidator, isAdminValidator, isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { UpdateDonationProcessReqBody, UpdateDonationRegistrationReqParams } from '~/models/requests/Donation.requests'

import { wrapAsync } from '~/utils/handler'

const donationRouter = express.Router()

/**
 * Description. Create a new donation
 * Path: /donation-registrations
 * METHOD: POST
 * Body : { user_id: string, blood_group_id: string, blood_component_id: string, start_date_donation: Date, status: DonationRegistrationStatus }
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
 */
donationRouter.get('/donation-registrations', isStaffOrAdminValidator, wrapAsync(getAllDonationRegistrationsController))

/**
 * Description. Get donation registration by user id
 * Path: /donation-registrations/user
 * METHOD: GET
 */
donationRouter.get(
  '/donation-registrations/user',
  accessTokenValidator,
  wrapAsync(getDonationRegistrationByUserIdController)
)

/**
 * Description. Update information a donation registration for customer
 * Path: /donation-registrations/:id
 * METHOD: PATCH
 * Body : { blood_group_id: string, blood_component_id: string, start_date_donation: Date }
 */
donationRouter.patch(
  '/donation-registrations/:id',
  accessTokenValidator,
  updateDonationRegistrationValidator,
  filterMiddleware<UpdateDonationRegistrationReqParams>([
    'blood_group_id',
    'blood_component_id',
    'start_date_donation'
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
 * Description. Get donation process by user id
 * Path: /donation-processes/user
 * METHOD: GET
 */
donationRouter.get('/donation-processes/user', accessTokenValidator, wrapAsync(getDonationProcessesController))

/**
 * Description. Update a donation request process for staff or admin
 * Path: /donation-request-processes/:id
 * METHOD: PATCH
 * Body : { status: string, description: string, donation_date: Date, volume_collected: number }
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
