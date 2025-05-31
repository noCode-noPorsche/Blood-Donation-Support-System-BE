import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { DONATION_MESSAGES } from '~/constants/messages'
import {
  GetDonationRegisterReqParams,
  GetDonationRequestProcessesReqParams,
  RegisterDonationReqBody,
  UpdateDonationRegistrationReqBody,
  UpdateDonationRegistrationReqParams,
  UpdateDonationRequestProcessReqBody,
  UpdateDonationRequestProcessReqParams,
  UpdateStatusDonationRegistrationReqBody,
  UpdateStatusDonationRequestProcessReqBody,
  UpdateStatusDonationRequestProcessReqParams
} from '~/models/requests/Donation.request'
import { TokenPayload } from '~/models/requests/User.requests'
import donationService from '~/services/donation.services'

//Donation Registration
export const createDonationRegistrationController = async (
  req: Request<ParamsDictionary, any, RegisterDonationReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { blood_group_id, blood_component_id, start_date_donation } = req.body
  const results = await donationService.registerDonation({
    user_id,
    payload: { blood_group_id, blood_component_id, start_date_donation }
  })
  res.json({
    message: DONATION_MESSAGES.REGISTRATION_SUCCESS,
    result: results
  })
}

export const getAllDonationRegistrationsController = async (req: Request, res: Response) => {
  const donationRegister = await donationService.getAllDonationRegisters()
  res.json({
    message: DONATION_MESSAGES.GET_ALL_DONATION_REGISTRATIONS_SUCCESS,
    result: donationRegister
  })
}

export const getDonationRegistrationByUserIdController = async (
  req: Request<GetDonationRegisterReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.params

  const donationRegisterByUserId = await donationService.getDonationRegisterByUserId(user_id)

  res.json({
    message: DONATION_MESSAGES.GET_DONATION_REGISTRATIONS_SUCCESS,
    result: donationRegisterByUserId
  })
}

export const updateStatusDonationRegistrationController = async (
  req: Request<UpdateDonationRegistrationReqParams, any, UpdateStatusDonationRegistrationReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { status } = req.body
  const updatedRegistration = await donationService.updateStatusDonationRegistration({ id, status })

  if (!updatedRegistration) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND })
    return
  }

  res.json({
    message: DONATION_MESSAGES.UPDATE_DONATION_REGISTRATION_SUCCESS,
    result: updatedRegistration
  })
}

export const updateDonationRegistrationController = async (
  req: Request<UpdateDonationRegistrationReqParams, any, UpdateDonationRegistrationReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { body } = req
  const updatedRegistration = await donationService.updateDonationRegistration({
    id,
    payload: body
  })

  if (!updatedRegistration) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND })
    return
  }

  res.json({
    message: DONATION_MESSAGES.UPDATE_DONATION_REGISTRATION_SUCCESS,
    result: updatedRegistration
  })
}

export const deleteDonationRegistrationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: DONATION_MESSAGES.DONATION_REGISTRATION_ID_INVALID })
    return
  }

  const deletedRegistration = await donationService.deleteDonationRegistration(id)

  if (!deletedRegistration) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND })
    return
  }

  res.status(200).json({
    message: DONATION_MESSAGES.DELETE_DONATION_REGISTRATION_SUCCESS,
    result: deletedRegistration
  })
}

//Donation Registration Process
export const getAllDonationRequestProcessesController = async (req: Request, res: Response) => {
  const donationRequestsProcess = await donationService.getAllDonationRequestProcesses()

  res.status(200).json({
    message: DONATION_MESSAGES.GET_ALL_DONATION_REQUEST_PROCESS_SUCCESS,
    result: donationRequestsProcess
  })
}

export const updateStatusDonationRequestProcessController = async (
  req: Request<UpdateStatusDonationRequestProcessReqParams, any, UpdateStatusDonationRequestProcessReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { status } = req.body
  const updatedProcess = await donationService.updateStatusDonationRequestProcess({ id, status })

  if (!updatedProcess) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_NOT_FOUND })
    return
  }

  res.json({
    message: DONATION_MESSAGES.UPDATE_DONATION_REQUEST_PROCESS_SUCCESS,
    result: updatedProcess
  })
}

export const updateDonationRequestProcessController = async (
  req: Request<UpdateDonationRequestProcessReqParams, any, UpdateDonationRequestProcessReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { status, description, donation_date, volume_collected } = req.body
  const updatedProcess = await donationService.updateDonationRequestProcess({
    id,
    payload: { status, description, donation_date, volume_collected }
  })

  if (!updatedProcess) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_NOT_FOUND })
    return
  }

  res.json({
    message: DONATION_MESSAGES.UPDATE_DONATION_REQUEST_PROCESS_SUCCESS,
    result: updatedProcess
  })
}

export const getDonationRequestProcessesController = async (
  req: Request<GetDonationRequestProcessesReqParams>,
  res: Response
) => {
  const { user_id } = req.params

  const donationRequestsProcess = await donationService.getDonationRequestProcessByUserId(user_id)

  if (donationRequestsProcess.length === 0) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_NOT_FOUND })
    return
  }

  res.json({
    message: DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS,
    result: donationRequestsProcess
  })
}

export const getDonationRequestProcessController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_ID_INVALID })
    return
  }

  const donationRequestProcess = await donationService.getDonationRequestProcess(id)

  if (!donationRequestProcess) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_NOT_FOUND })
    return
  }

  res.status(200).json({
    message: DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS,
    result: donationRequestProcess
  })
}

// export const updateDonationRequestProcessController = async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params
//   const { status, volumeCollected, donationDate, description } = req.body

//   if (!ObjectId.isValid(id)) {
//     res.status(400).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_ID_INVALID })
//     return
//   }

//   const updatedProcess = await donationService.updateDonationRequestProcess(id, {
//     status,
//     volumeCollected,
//     donationDate: donationDate ? new Date(donationDate) : undefined,
//     description
//   })

//   if (!updatedProcess) {
//     res.status(404).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_NOT_FOUND })
//     return
//   }

//   res.status(200).json({
//     message: DONATION_MESSAGES.UPDATE_DONATION_REQUEST_PROCESS_SUCCESS,
//     result: updatedProcess
//   })
// }
