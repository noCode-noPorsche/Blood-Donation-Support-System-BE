import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { DONATION_MESSAGES } from '~/constants/messages'
import {
  DonationRegistrationReqBody,
  UpdateDonationProcessReqBody,
  UpdateDonationProcessReqParams,
  UpdateDonationRegistrationReqBody,
  UpdateDonationRegistrationReqParams
} from '~/models/requests/Donation.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import donationService from '~/services/donation.services'

//Donation Registration
export const createDonationRegistrationController = async (
  req: Request<ParamsDictionary, any, DonationRegistrationReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { blood_group_id, blood_component_id, start_date_donation } = req.body
  const results = await donationService.createDonationRegistration({
    user_id,
    payload: { blood_group_id, blood_component_id, start_date_donation }
  })
  res.json({
    message: DONATION_MESSAGES.REGISTRATION_SUCCESS,
    result: results
  })
}

export const getAllDonationRegistrationsController = async (req: Request, res: Response) => {
  const donationRegistration = await donationService.getAllDonationRegistration()
  res.json({
    message: DONATION_MESSAGES.GET_ALL_DONATION_REGISTRATIONS_SUCCESS,
    result: donationRegistration
  })
}

export const getDonationRegistrationByUserIdController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const donationRegistrationByUserId = await donationService.getDonationRegistrationByUserId(user_id)

  res.json({
    message: DONATION_MESSAGES.GET_DONATION_REGISTRATIONS_SUCCESS,
    result: donationRegistrationByUserId
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

// export const deleteDonationRegistrationController = async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params

//   if (!ObjectId.isValid(id)) {
//     res.status(400).json({ message: DONATION_MESSAGES.DONATION_REGISTRATION_ID_INVALID })
//     return
//   }

//   const deletedRegistration = await donationService.deleteDonationRegistration(id)

//   if (!deletedRegistration) {
//     res.status(404).json({ message: DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND })
//     return
//   }

//   res.status(200).json({
//     message: DONATION_MESSAGES.DELETE_DONATION_REGISTRATION_SUCCESS,
//     result: deletedRegistration
//   })
// }

//Donation Registration Process
export const getAllDonationProcessesController = async (req: Request, res: Response) => {
  const donationRequestsProcess = await donationService.getAllDonationProcesses()

  res.status(200).json({
    message: DONATION_MESSAGES.GET_ALL_DONATION_REQUEST_PROCESS_SUCCESS,
    result: donationRequestsProcess
  })
}

export const updateDonationProcessController = async (
  req: Request<UpdateDonationProcessReqParams, any, UpdateDonationProcessReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const updatedProcess = await donationService.updateDonationProcess({
    id,
    payload: body,
    user_id
  })

  if (!updatedProcess) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND })
    return
  }

  res.json({
    message: DONATION_MESSAGES.UPDATE_DONATION_REQUEST_PROCESS_SUCCESS,
    result: updatedProcess
  })
}

export const getDonationProcessesController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const donationProcess = await donationService.getDonationProcessByUserId(user_id)

  if (donationProcess.length === 0) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND })
    return
  }

  res.json({
    message: DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS,
    result: donationProcess
  })
}

export const getDonationProcessController = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_ID_INVALID })
    return
  }

  const donationProcess = await donationService.getDonationProcess(id)

  if (!donationProcess) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_PROCESS_NOT_FOUND })
    return
  }

  res.status(200).json({
    message: DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS,
    result: donationProcess
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
