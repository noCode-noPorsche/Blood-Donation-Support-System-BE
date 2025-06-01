import express from 'express'
import {
  createDonationRegistrationController,
  deleteDonationRegistrationController,
  getAllDonationRegistrationsController,
  getAllDonationRequestProcessesController,
  getDonationRegistrationByUserIdController,
  getDonationRequestProcessesController,
  updateDonationRegistrationController,
  updateDonationRequestProcessController,
  updateStatusDonationRegistrationController,
  updateStatusDonationRequestProcessController
  // updateDonationRequestProcessController
} from '~/controllers/donation.controllers'
import { filterMiddleware } from '~/middlewares/common.middleware'
import {
  createDonationValidator,
  updateDonationRegistrationValidator,
  updateDonationRequestProcessValidator,
  updateStatusDonationRegistrationValidator,
  updateStatusDonationRequestProcessValidator
} from '~/middlewares/donation.middleware'
import { accessTokenValidator, isAdminValidator, isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import {
  UpdateDonationRegistrationReqParams,
  UpdateDonationRequestProcessReqBody,
  UpdateStatusDonationRequestProcessReqBody
} from '~/models/requests/Donation.requests'

import { wrapAsync } from '~/utils/handler'

const donationRouter = express.Router()

/**
 * Description. Create a new donation
 * Path: /donation-registrations
 * METHOD: POST
 * Body : { user_id: string, blood_group_id: string, blood_component_id: string, start_date_donation: Date, status: DonationRegisterStatus }
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
 * Path: /donation-registrations/:user_id
 * METHOD: GET
 */
donationRouter.get(
  '/donation-registrations/:user_id',
  accessTokenValidator,
  wrapAsync(getDonationRegistrationByUserIdController)
)

/**
 * Description. Update status a donation registration for staff or admin
 * Path: /donation-registrations/:id/status
 * METHOD: PATCH
 * Body : { status: DonationRegisterStatus }
 */
donationRouter.patch(
  '/donation-registrations/:id/status',
  isStaffOrAdminValidator,
  updateStatusDonationRegistrationValidator,
  filterMiddleware<UpdateDonationRegistrationReqParams>(['status']),
  wrapAsync(updateStatusDonationRegistrationController)
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
donationRouter.delete(
  '/donation-registration/:id',
  accessTokenValidator,
  isAdminValidator,
  wrapAsync(deleteDonationRegistrationController)
)

/**
 * Description. Get all donation request processes for staff or admin
 * Path: /donation-request-processes
 * METHOD: GET
 */
donationRouter.get(
  '/donation-request-processes',
  isStaffOrAdminValidator,
  wrapAsync(getAllDonationRequestProcessesController)
)

/**
 * Description. Get donation request process by user id
 * Path: /donation-request-processes/:user_id
 * METHOD: GET
 */
donationRouter.get(
  '/donation-request-processes/:user_id',
  accessTokenValidator,
  wrapAsync(getDonationRequestProcessesController)
)

/**
 * Description. Update status a donation request process for staff or admin
 * Path: /donation-request-processes/:id/status
 * METHOD: PATCH
 * Body : { status: DonationRequestProcessStatus }
 */
donationRouter.patch(
  '/donation-request-processes/:id/status',
  isStaffOrAdminValidator,
  updateStatusDonationRequestProcessValidator,
  filterMiddleware<UpdateStatusDonationRequestProcessReqBody>(['status']),
  wrapAsync(updateStatusDonationRequestProcessController)
)

/**
 * Description. Update a donation request process for staff or admin
 * Path: /donation-request-processes/:id
 * METHOD: PATCH
 * Body : { status: string, description: string, donation_date: Date, volume_collected: number }
 */
donationRouter.patch(
  '/donation-request-processes/:id',
  isStaffOrAdminValidator,
  updateDonationRequestProcessValidator,
  filterMiddleware<UpdateDonationRequestProcessReqBody>(['status', 'description', 'donation_date', 'volume_collected']),
  wrapAsync(updateDonationRequestProcessController)
)

//not use
/**
 * Description. Delete a donation request process
 * Path: /donation-request-processes/:id
 * METHOD: DELETE
 */
donationRouter.delete(
  '/donation-request-processes/:id',
  accessTokenValidator,
  isAdminValidator,
  wrapAsync(deleteDonationRegistrationController)
)

export default donationRouter
