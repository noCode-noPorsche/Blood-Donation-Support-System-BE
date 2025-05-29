import express from 'express'
import { get, update } from 'lodash';
import { deleteDonationRegistrationController, getDonationRegistrationController, getDonationRegistrationsController, getDonationRequestProcessesController, registerDonationController, updateDonationRegistrationController, updateDonationRequestProcessController } from '~/controllers/donation.controllers';
import { createDonationValidator } from '~/middlewares/donation.middleware';
import { accessTokenValidator, isAdminValidator } from '~/middlewares/user.middlewares';
import { wrapAsync } from "~/utils/handler";
const donationRouter = express.Router()

/**
 * @openapi
 * /registerDonation:
 *   post:
 *     summary: Đăng ký hiến máu
 *     tags:
 *       - Donation
 *     
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       400:
 *         description: Lỗi dữ liệu
 */

donationRouter.post('/registerDonation', accessTokenValidator,createDonationValidator, wrapAsync(registerDonationController))

/**
 * @openapi
 * /donationRegistrations:
 *   get:
 *     summary: Lấy danh sách đăng ký hiến máu
 *     tags:
 *       - Donation
 *     responses:
 *       200:
 *         description: Danh sách đăng ký hiến máu
 */
donationRouter.get('/donationRegistrations', accessTokenValidator, wrapAsync(getDonationRegistrationsController))

/**
 * @openapi
 * /donationRegistration:
 *   get:
 *     summary: Lấy danh sách đăng ký hiến máu by user_id
 *     tags:
 *       - Donation
 *     responses:
 *       200:
 *         description: Danh sách đăng ký hiến máu
 */
donationRouter.get('/donationRegistration', accessTokenValidator, wrapAsync(getDonationRegistrationController))

/**
 * @openapi
 * /donationRegistration/{id}:
 *   patch:
 *    summary: Cập nhật trạng thái đăng ký hiến máu
 * *    tags:
 *      - Donation
 * *    parameters:
 *      - in: path
 *        name: id
 *       required: true
 *      responses:
 *       200:
 *        description: Cập nhật thành công
 */ 

donationRouter.patch('/donationRegistration/:id', accessTokenValidator, wrapAsync(updateDonationRegistrationController))

/**
 * @openapi
 * /donationRegistration/{id}:
 *  delete:
 *   summary: Xóa đăng ký hiến máu
 * *   tags:
 *     - Donation
 * *   responses:
 *      200:
 *       description: Xóa thành công
 */
donationRouter.delete('/donationRegistration/:id', accessTokenValidator,isAdminValidator, wrapAsync(deleteDonationRegistrationController))

/**
 * @openapi
 * /donationRequestProcesses:
 *  get:
 *  summary: Lấy danh sách quá trình đăng ký hiến máu
 * *  tags:
 *    - Donation
 * *  responses:
 *    200:
 *      description: Danh sách quá trình đăng ký hiến máu
 * 
 */
donationRouter.get('/donationRequestProcesses', accessTokenValidator, wrapAsync(getDonationRequestProcessesController))

/**
 * @openapi
 * /donationRequestProcess/{id}:
 *  patch:
 *   summary: Cập nhật quá trình đăng ký hiến máu
 * *   tags:
 *     - Donation
 * *   parameters:
 *      - in: path
 *        name: id
 *       required: true
 *      responses:
 *       200:
 *        description: Cập nhật thành công
 */
donationRouter.patch('/donationRequestProcess/:id', accessTokenValidator, isAdminValidator, wrapAsync(updateDonationRequestProcessController))

/**
 * @openapi
 * /donationRequestProcess/{id}:
 *  delete:
 *   summary: Xóa quá trình đăng ký hiến máu
 * *   tags:
 *     - Donation
 * *   responses:
 *      200:
 *       description: Xóa thành công
 */
donationRouter.delete('/donationRequestProcess/:id', accessTokenValidator, isAdminValidator, wrapAsync(deleteDonationRegistrationController))

export default donationRouter