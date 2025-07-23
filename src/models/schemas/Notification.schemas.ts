import { ObjectId } from 'mongodb'

interface NotificationType {
  _id?: ObjectId
  receiver_id: ObjectId
  donation_registration_id?: ObjectId
  title: string
  message: string
  created_at?: Date
  is_read?: boolean
  type?: string // Optional field for future use
}

export default class Notification {
  _id?: ObjectId
  receiver_id: ObjectId
  donation_registration_id?: ObjectId
  title: string
  message: string
  created_at?: Date
  is_read?: boolean
  type?: string
  constructor(notification: NotificationType) {
    const date = new Date()
    this._id = notification._id
    this.receiver_id = notification.receiver_id
    this.donation_registration_id = notification.donation_registration_id
    this.title = notification.title
    this.message = notification.message
    this.created_at = notification.created_at || date
    this.is_read = notification.is_read || false
    this.type = notification.type || ''
  }
}
