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
 * Path: /donation-registration
 * METHOD: POST
 * Body : { user_id: string, blood_group_id: string, blood_component_id: string, start_date_donation: Date, status: DonationRegisterStatus }
 * Header: { Authorization: Bearer <access_token>}
 */
donationRouter.post(
  '/donation-registration',
  accessTokenValidator,
  createDonationValidator,
  wrapAsync(createDonationRegistrationController)
)

/**
 * Description. Get all donation registrations for staff or admin
 * Path: /donation-registration
 * METHOD: GET
 */
donationRouter.get('/donation-registration', isStaffOrAdminValidator, wrapAsync(getAllDonationRegistrationsController))

/**
 * Description. Get donation registration by user id
 * Path: /donation-registration/:user_id
 * METHOD: GET
 */
donationRouter.get(
  '/donation-registration/:user_id',
  accessTokenValidator,
  wrapAsync(getDonationRegistrationByUserIdController)
)

/**
 * Description. Update status a donation registration for staff or admin
 * Path: /donation-registration/:id
 * METHOD: PATCH
 * Body : { status: DonationRegisterStatus }
 */
donationRouter.patch(
  '/donation-registration-status/:id',
  isStaffOrAdminValidator,
  updateStatusDonationRegistrationValidator,
  filterMiddleware<UpdateDonationRegistrationReqParams>(['status']),
  wrapAsync(updateStatusDonationRegistrationController)
)

/**
 * Description. Update information a donation registration for customer
 * Path: /donation-registration/:id
 * METHOD: PATCH
 * Body : { blood_group_id: string, blood_component_id: string, start_date_donation: Date }
 */
donationRouter.patch(
  '/donation-registration/:id',
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
 * Path: /donation-request-process
 * METHOD: GET
 */
donationRouter.get(
  '/donation-request-process',
  isStaffOrAdminValidator,
  wrapAsync(getAllDonationRequestProcessesController)
)

/**
 * Description. Get donation request process by user id
 * Path: /donation-request-process/:user_id
 * METHOD: GET
 */
donationRouter.get(
  '/donation-request-process/:user_id',
  accessTokenValidator,
  wrapAsync(getDonationRequestProcessesController)
)

/**
 * Description. Update status a donation request process for staff or admin
 * Path: /donation-request-process-status/:id
 * METHOD: PATCH
 * Body : { status: DonationRequestProcessStatus }
 */
donationRouter.patch(
  '/donation-request-process-status/:id',
  isStaffOrAdminValidator,
  updateStatusDonationRequestProcessValidator,
  filterMiddleware<UpdateStatusDonationRequestProcessReqBody>(['status']),
  wrapAsync(updateStatusDonationRequestProcessController)
)

/**
 * Description. Update a donation request process
 * Path: /donation-request-process/:id
 * METHOD: PATCH
 * Body : { status: string }
 */
donationRouter.patch(
  '/donation-request-process/:id',
  isStaffOrAdminValidator,
  updateDonationRequestProcessValidator,
  filterMiddleware<UpdateDonationRequestProcessReqBody>(['status', 'description', 'donation_date', 'volume_collected']),
  wrapAsync(updateDonationRequestProcessController)
)

//not use
/**
 * Description. Delete a donation request process
 * Path: /donation-request-process/:id
 * METHOD: DELETE
 */
donationRouter.delete(
  '/donation-request-process/:id',
  accessTokenValidator,
  isAdminValidator,
  wrapAsync(deleteDonationRegistrationController)
)

export default donationRouter
