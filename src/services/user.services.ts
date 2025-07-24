import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { TokenType, UserRole } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import {
  ChangeRoleForAdminReqBody,
  RegisterForAdminReqBody,
  RegisterReqBody,
  UpdateMeReqBody
} from '~/models/requests/User.requests'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import User from '~/models/schemas/User.schemas'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { USER_MESSAGES } from './../constants/messages'
import databaseService from './database.services'
config()

class UsersService {
  private signAccessToken({ user_id, role }: { user_id: string; role: UserRole }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        role
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as `${number}${'m' | 'h' | 'd'}`
      }
    })
  }

  private signRefreshToken({ user_id, role }: { user_id: string; role: UserRole }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        role
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as `${number}${'m' | 'h' | 'd'}`
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string, role: UserRole) {
    return Promise.all([this.signAccessToken({ user_id, role }), this.signRefreshToken({ user_id, role })])
  }

  async register(payload: RegisterReqBody) {
    const newUser = new User({
      ...payload,
      citizen_id_number: payload.citizen_id_number,
      date_of_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password),
      role: UserRole.Customer,
      blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : undefined,
      location: {
        type: 'Point',
        coordinates: [payload.longitude || 0, payload.latitude || 0]
      },
      address: payload.address || '',
      avatar_url: payload.avatar_url || '',
      created_at: new Date(),
      updated_at: new Date(),
      fcm_token: payload.fcm_token || '',
      is_active: true
    })

    const result = await databaseService.users.insertOne(newUser)
    const user_id = result.insertedId.toString()

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id, newUser.role)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async registerForAdmin(payload: RegisterForAdminReqBody) {
    const newUser = new User({
      ...payload,
      citizen_id_number: payload.citizen_id_number,
      date_of_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password),
      role: payload.role,
      blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : undefined,
      location: {
        type: 'Point',
        coordinates: [payload.longitude || 0, payload.latitude || 0]
      },
      address: payload.address || '',
      avatar_url: payload.avatar_url || '',
      created_at: new Date(),
      updated_at: new Date(),
      fcm_token: payload.fcm_token || '',
      is_active: true
    })

    const result = await databaseService.users.insertOne(newUser)
    const user_id = result.insertedId.toString()

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id, newUser.role)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async login(user_id: string, fcm_token?: string) {
    const user = (await databaseService.users.findOne({ _id: new ObjectId(user_id) })) as User
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id, user?.role)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    if (fcm_token) {
      await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { fcm_token } })
    }
    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async refreshToken({ user_id, role, refresh_token }: { user_id: string; role: UserRole; refresh_token: string }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, role }),
      this.signRefreshToken({ user_id, role }),
      databaseService.refreshToken.deleteOne({ token: refresh_token })
    ])
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async checkCitizenIDNumber(citizen_id_number: string) {
    const user = await databaseService.users.findOne({ citizen_id_number })
    return Boolean(user)
  }

  async checkPhoneExist(phone: string) {
    const user = await databaseService.users.findOne({ phone })
    return Boolean(user)
  }

  async getProfileByCitizenIdNumber(citizen_id_number: string) {
    const user = await databaseService.users.findOne(
      { citizen_id_number: citizen_id_number },
      { projection: { password: 0 } }
    )
    // if (!user) {
    //   throw new ErrorWithStatus({
    //     message: USER_MESSAGES.USER_NOT_FOUND,
    //     status: HTTP_STATUS.NOT_FOUND
    //   })
    // }
    return user
  }

  async getAllUser() {
    const user = await databaseService.users.find({}, { projection: { password: 0 } }).toArray()
    if (!user) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  async getMe(user_id: string) {
    const users = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'blood_groups',
            localField: 'blood_group_id',
            foreignField: '_id',
            as: 'blood_group'
          }
        },
        {
          $unwind: {
            path: '$blood_group',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            password: 0,
            forgot_password_token: 0,
            'blood_group._id': 0,
            'blood_group.created_at': 0,
            'blood_group.updated_at': 0
          }
        }
      ])
      .toArray()
    return users[0]
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...payload,
          date_of_birth: new Date(payload.date_of_birth as string),
          location: {
            type: 'Point',
            coordinates: [payload.longitude || 0, payload.latitude || 0]
          },
          address: payload.address || '',
          blood_group_id: payload.blood_group_id ? new ObjectId(payload.blood_group_id) : null // hoặc undefined nếu bạn muốn bỏ qua
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: { password: 0, forgot_password_token: 0 }
      }
    )
    return user
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(password) }, $currentDate: { updated_at: true } }
    )
    return {
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  async changeIsActive(user_id: string) {
    const _id = new ObjectId(user_id)
    const user = await databaseService.users.findOne({ _id })
    if (!user)
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })

    await databaseService.users.findOneAndUpdate({ _id }, { $set: { is_active: !user.is_active } })

    return {
      message: USER_MESSAGES.UPDATE_IS_ACTIVE_SUCCESS
    }
  }

  async changeRoleForAdmin(user_id: string, payload: ChangeRoleForAdminReqBody) {
    const _id = new ObjectId(user_id)
    const user = await databaseService.users.findOne({ _id })
    if (!user)
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })

    await databaseService.users.findOneAndUpdate({ _id }, { $set: { role: payload.role } })

    return {
      message: USER_MESSAGES.CHANGE_ROLE_SUCCESS
    }
  }
}

const usersService = new UsersService()
export default usersService
