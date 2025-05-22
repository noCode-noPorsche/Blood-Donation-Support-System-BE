import { ObjectId } from 'mongodb'
import { UserRole } from '~/constants/enum'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  role?: UserRole
  created_at?: Date
  user_id: ObjectId
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  role?: UserRole
  created_at: Date
  user_id: ObjectId
  constructor({ _id, token, role, created_at, user_id }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.role = role || UserRole.Customer
    this.created_at = created_at || new Date()
    this.user_id = user_id
  }
}
