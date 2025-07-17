import { Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { NOTIFICATION_MESSAGES } from '~/constants/messages'
import { MarkNotificationAsReadReqParams } from '~/models/requests/Notification.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import notificationService from '~/services/notification.services'

export const getNotificationByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await notificationService.getNotificationByUserId(user_id)
  res.json({
    message: NOTIFICATION_MESSAGES.GET_NOTIFICATIONS_SUCCESS,
    result
  })
}

export const markNotificationAsReadByIdController = async (
  req: Request<MarkNotificationAsReadReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await notificationService.markNotificationAsReadById(id, user_id)
  res.json({
    message: NOTIFICATION_MESSAGES.MARK_NOTIFICATION_AS_READ_SUCCESS,
    result
  })
}

export const markAllNotificationsAsReadController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await notificationService.markAllNotificationsAsRead(user_id)

  res.json({
    message: NOTIFICATION_MESSAGES.MARK_NOTIFICATION_AS_READ_SUCCESS,
    result
  })
}
