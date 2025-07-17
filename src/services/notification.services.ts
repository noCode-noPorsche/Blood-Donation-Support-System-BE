import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { NOTIFICATION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from './database.services'
config()

class NotificationService {
  async getNotificationByUserId(userId: string) {
    const notifications = await databaseService.notifications.find({ receiver_id: new ObjectId(userId) }).toArray()
    if (!notifications) {
      throw new ErrorWithStatus({
        message: NOTIFICATION_MESSAGES.GET_NOTIFICATIONS_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return notifications
  }

  async markNotificationAsReadById(notificationId: string, userId: string) {
    const notification = await databaseService.notifications.findOneAndUpdate(
      { _id: new ObjectId(notificationId), receiver_id: new ObjectId(userId) },
      { $set: { is_read: true } },
      { returnDocument: 'after' }
    )
    if (!notification) {
      throw new ErrorWithStatus({
        message: NOTIFICATION_MESSAGES.MARK_NOTIFICATION_AS_READ_FAILED,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return notification
  }

  async markAllNotificationsAsRead(userId: string) {
    const notifications = await databaseService.notifications.updateMany(
      { receiver_id: new ObjectId(userId), is_read: false },
      { $set: { is_read: true } }
    )
    // if (result.modifiedCount === 0) {
    //   throw new ErrorWithStatus({
    //     message: NOTIFICATION_MESSAGES.MARK_NOTIFICATION_AS_READ_FAILED,
    //     status: HTTP_STATUS.NOT_FOUND
    //   })
    // }
    return notifications
  }
}

const notificationService = new NotificationService()
export default notificationService
