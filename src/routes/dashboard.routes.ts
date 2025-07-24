import express from 'express'
import {
  getAllDonationNumberController,
  getAllRequestNumberController,
  getAllUserNumberController,
  getBloodStockSummaryController,
  getBloodStorageSummaryController,
  getDashboardAdminOverviewController,
  getDashboardWarehouseOverviewController
} from '~/controllers/dashboard.controllers'
import { isAdminValidator, isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const dashboardRouter = express.Router()

/**
 * Description. Get all donation
 * Path: /number-donation
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
dashboardRouter.get('/number-donation', isAdminValidator, wrapAsync(getAllDonationNumberController))

/**
 * Description. Get all request
 * Path: /number-request
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
dashboardRouter.get('/number-request', isAdminValidator, wrapAsync(getAllRequestNumberController))

/**
 * Description. Get all users
 * Path: /number-users
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
dashboardRouter.get('/number-user', isAdminValidator, wrapAsync(getAllUserNumberController))

/**
 * Description. Get blood stock summary
 * Path: /blood-stock-summary
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
dashboardRouter.get('/blood-stock-summary', isAdminValidator, wrapAsync(getBloodStockSummaryController))

/**
 * Description. Get blood storage summary
 * Path: /blood-storage-summary
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
dashboardRouter.get('/blood-storage-summary', isStaffOrAdminValidator, wrapAsync(getBloodStorageSummaryController))

/**
 * Description. Get dashboards overview for admin
 * Path: /overview-admin
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
dashboardRouter.get('/overview-admin', isStaffOrAdminValidator, wrapAsync(getDashboardAdminOverviewController))

/**
 * Description. Get dashboards overview for staff warehouse
 * Path: /overview-warehouse
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
dashboardRouter.get('/overview-warehouse', isStaffOrAdminValidator, wrapAsync(getDashboardWarehouseOverviewController))

export default dashboardRouter
