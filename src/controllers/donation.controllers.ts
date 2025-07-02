import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { DONATION_MESSAGES } from '~/constants/messages'
import {
  DonationRegistrationReqBody,
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
  const donationHealthProcess = await donationService.getAllDonationHealthProcessByUserId(user_id)
  res.json({
    message: DONATION_MESSAGES.GET_ALL_DONATION_REGISTRATIONS_SUCCESS,
    result: donationHealthProcess
  })
}

export const getDonationHealthProcessByDonationIdController = async (
  req: Request<GetDonationHealthProcessByDonationIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const donationHealthProcess = await donationService.getDonationHealthProcessByDonationId(id)
  res.json({
    message: DONATION_MESSAGES.GET_ALL_DONATION_REGISTRATIONS_SUCCESS,
    result: donationHealthProcess
  })
}

export const getStatusDonationHealthProcessByDonationIdController = async (
  req: Request<GetStatusDonationHealthProcessByDonationIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const donationHealthProcessStatus = await donationService.getStatusDonationHealthProcessByDonationId(id)
  res.json({
    message: DONATION_MESSAGES.GET_STATUS_DONATION_HEALTH_PROCESS_SUCCESS,
    result: donationHealthProcessStatus
  })
}

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

export const getDonationRegistrationByIdController = async (
  req: Request<GetDonationRegistrationIdReqParams, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  const donationRegistrationById = await donationService.getDonationRegistrationId(id)

  res.json({
    message: DONATION_MESSAGES.GET_DONATION_REGISTRATIONS_SUCCESS,
    result: donationRegistrationById
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
  req: Request<UpdateDonationRegistrationIdReqParams, any, UpdateDonationRegistrationReqBody>,
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

//Donation Process
export const getAllDonationProcessesController = async (req: Request, res: Response) => {
  const filter: any = {}

  const { is_separated } = req.query
  if (is_separated !== undefined) {
    filter.is_separated = is_separated === 'true'
  }
  const donationRequestsProcess = await donationService.getAllDonationProcesses(filter)
  res.json({
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

export const getDonationProcessByUserIdController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  console.log('user_id', user_id)
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

export const getDonationProcessesByIdController = async (
  req: Request<GetDonationProcessIdReqParams, any, any>,
  res: Response
) => {
  const { id } = req.params
  const result = await donationService.getDonationProcessById(id)

  res.json({
    message: DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS,
    result: result
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
