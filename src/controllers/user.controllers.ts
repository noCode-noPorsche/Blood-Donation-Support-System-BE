import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/messages'
import {
  ChangePasswordReqBody,
  GetProfileByCitizenIdNumberReqParam,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  UpdateMeReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schemas'
import usersService from '~/services/user.services'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const { fcm_token } = req.body
  const result = await usersService.login(user_id.toString(), fcm_token)
  res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, role } = req.decode_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, role, refresh_token })
  res.json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await usersService.getMe(user_id)
  res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const getAllUserController = async (req: Request, res: Response) => {
  const result = await usersService.getAllUser()
  res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const getProfileByCitizenIdNumberController = async (
  req: Request<GetProfileByCitizenIdNumberReqParam, any, any>,
  res: Response
) => {
  const { citizen_id_number } = req.params
  const result = await usersService.getProfileByCitizenIdNumber(citizen_id_number)
  res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const result = await usersService.updateMe(user_id, body)
  res.json({
    message: USER_MESSAGES.UPDATE_PROFILE_SUCCESS,
    result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  res.json(result)
}
