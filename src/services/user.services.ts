import User from '~/models/schemas/User.schemas'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USER_MESSAGES } from '~/constants/messages'
import { TokenType, UserRole } from '~/constants/enum'
import { RegisterReqBody } from '~/models/requests/User.requests'
import databaseService from './database.services'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
config()

class UsersService {
  private signAccessToken({ user_id, role }: { user_id: string; role: UserRole }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        role
      },
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
      date_of_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password)
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

  async login(user_id: string) {
    const user = (await databaseService.users.findOne({ _id: new ObjectId(user_id) })) as User
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id, user?.role)
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

  async checkPhoneExist(phone: string) {
    const user = await databaseService.users.findOne({ phone })
    return Boolean(user)
  }
}

const usersService = new UsersService()
export default usersService
