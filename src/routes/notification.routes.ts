import express from 'express'
import {
  getNotificationByUserIdController,
  markAllNotificationsAsReadController,
  markNotificationAsReadByIdController
} from '~/controllers/notification.controllers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const notificationRouter = express.Router()

/**
 * Description. Get all notifications by user id
 * Path: /user
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
notificationRouter.get('/user', accessTokenValidator, wrapAsync(getNotificationByUserIdController))

/**
 * Description. Mark a notification as read
 * Path: /:id/read
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token>}
 */
notificationRouter.patch('/:id/read', accessTokenValidator, wrapAsync(markNotificationAsReadByIdController))

/**
 * Description. Mark all notifications as read for a user
 * Path: /user/read-all
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 */
notificationRouter.patch('/user/read-all', accessTokenValidator, wrapAsync(markAllNotificationsAsReadController))

export default notificationRouter
