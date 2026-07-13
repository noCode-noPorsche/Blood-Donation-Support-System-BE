import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { DonationProcessStatus } from '~/constants/enum'
import { DONATION_MESSAGES } from '~/constants/messages'
import {
  CreateDonationRegistrationReqBody,
  GetDonationHealthProcessByDonationIdReqParams,
  GetDonationProcessIdReqParams,
  GetDonationRegistrationIdReqParams,
  GetStatusDonationHealthProcessByDonationIdReqParams,
  UpdateDonationProcessReqBody,
  UpdateDonationProcessReqParams,
  UpdateDonationRegistrationIdReqParams,
  UpdateDonationRegistrationReqBody
} from '~/models/requests/Donation.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import donationService from '~/services/donation.services'

//Donation - Health - Process
export const getAllDonationHealthProcessByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await donationService.getAllDonationHealthProcessByUserId(user_id)
  res.sendSuccess?.(DONATION_MESSAGES.GET_ALL_DONATION_REGISTRATIONS_SUCCESS, { result })
}

export const getDonationHealthProcessByDonationIdController = async (
  req: Request<GetDonationHealthProcessByDonationIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params

  const result = await donationService.getDonationHealthProcessByDonationId(id)
  res.sendSuccess?.(DONATION_MESSAGES.GET_ALL_DONATION_REGISTRATIONS_SUCCESS, { result })
}

export const getStatusDonationHealthProcessByDonationIdController = async (
  req: Request<GetStatusDonationHealthProcessByDonationIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params

  const result = await donationService.getStatusDonationHealthProcessByDonationId(id)
  res.sendSuccess?.(DONATION_MESSAGES.GET_STATUS_DONATION_HEALTH_PROCESS_SUCCESS, { result })
}

//Donation Registration
export const createDonationRegistrationController = async (
  req: Request<ParamsDictionary, any, CreateDonationRegistrationReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req

  const result = await donationService.createDonationRegistration({
    user_id,
    payload: body
  })
  res.sendSuccess?.(DONATION_MESSAGES.CREATE_DONATION_REGISTRATION_SUCCESS, { result })
}

export const getAllDonationRegistrationsController = async (req: Request, res: Response) => {
  const result = await donationService.getAllDonationRegistration()
  res.sendSuccess?.(DONATION_MESSAGES.GET_ALL_DONATION_REGISTRATIONS_SUCCESS, { result })
}

export const getDonationRegistrationByIdController = async (
  req: Request<GetDonationRegistrationIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params

  const result = await donationService.getDonationRegistrationById(id)
  res.sendSuccess?.(DONATION_MESSAGES.GET_DONATION_REGISTRATIONS_SUCCESS, { result })
}

export const getDonationRegistrationByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await donationService.getDonationRegistrationByUserId(user_id)
  res.sendSuccess?.(DONATION_MESSAGES.GET_DONATION_REGISTRATIONS_SUCCESS, { result })
}

export const updateDonationRegistrationController = async (
  req: Request<UpdateDonationRegistrationIdReqParams, any, UpdateDonationRegistrationReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { body } = req

  const result = await donationService.updateDonationRegistration({
    id,
    payload: body
  })
  res.sendSuccess?.(DONATION_MESSAGES.UPDATE_DONATION_REGISTRATION_SUCCESS, { result })
}

//Donation Process
export const getAllDonationProcessesController = async (req: Request, res: Response) => {
  const filter: any = {}

  const { is_separated, status } = req.query

  if (is_separated !== undefined) {
    filter.is_separated = is_separated === 'true'
  }

  if (
    status !== undefined &&
    typeof status === 'string' &&
    Object.values(DonationProcessStatus).includes(status as DonationProcessStatus)
  ) {
    filter.status = status
  }

  const result = await donationService.getAllDonationProcesses(filter)
  res.sendSuccess?.(DONATION_MESSAGES.GET_ALL_DONATION_REQUEST_PROCESS_SUCCESS, { result })
}

export const updateDonationProcessController = async (
  req: Request<UpdateDonationProcessReqParams, any, UpdateDonationProcessReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req

  const result = await donationService.updateDonationProcess({
    id,
    payload: body,
    user_id
  })
  res.sendSuccess?.(DONATION_MESSAGES.UPDATE_DONATION_REQUEST_PROCESS_SUCCESS, { result })
}

export const getDonationProcessByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await donationService.getDonationProcessByUserId(user_id)
  res.sendSuccess?.(DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS, { result })
}

export const getDonationProcessesByIdController = async (
  req: Request<GetDonationProcessIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params

  const result = await donationService.getDonationProcessById(id)
  res.sendSuccess?.(DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS, { result })
}
