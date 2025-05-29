import { Request, Response } from "express"
import { ObjectId } from "mongodb"
import { DONATION_MESSAGES } from "~/constants/messages"
import User from "~/models/schemas/User.schemas"
import donationService from "~/services/donate.services"


export const registerDonationController = async (req: Request, res: Response) => {
    const { user_id,blood_group_id, blood_component_id } = req.body

    const results = await donationService.registration(user_id,blood_group_id, blood_component_id)
    res.json({
        message: DONATION_MESSAGES.REGISTRATION_SUCCESS,
        result: results
    })
}
export const getDonationRegistrationsController = async (req: Request, res: Response) => {
    const donationRegister = await donationService.getDonationRegisters()
    res.json({
        message: DONATION_MESSAGES.GET_DONATION_REGISTRATIONS_SUCCESS,
        result: donationRegister
    })
}

export const getDonationRegistrationController = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.query

  if (!user_id || !ObjectId.isValid(user_id as string)) {
    res.status(400).json({ message: DONATION_MESSAGES.USERID_IS_INVALID}) // ❌ KHÔNG return
    return
  }

  const donationRegister = await donationService.getDonationRegisters()
  const userDonationRegister = donationRegister.filter((donation: any) => {
    return donation.userId.toString() === user_id
  })

  res.status(200).json({
    message: DONATION_MESSAGES.GET_DONATION_REGISTRATIONS_SUCCESS,
    result: userDonationRegister
  })
}

export const updateDonationRegistrationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const updateData = req.body

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: DONATION_MESSAGES.DONATON_REGISTRATION_ID_INVALID })
    return
  }

  const updatedRegistration = await donationService.updateDonationRegistration(id, updateData)

  if (!updatedRegistration) {
    res.status(404).json({ message:DONATION_MESSAGES.DONATION_REGISTRATION_NOT_FOUND  })
    return
  }

  res.status(200).json({
    message: DONATION_MESSAGES.UPDATE_DONATION_REGISTRATION_SUCCESS,
    result: updatedRegistration
  })
}
export const deleteDonationRegistrationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: DONATION_MESSAGES.DONATON_REGISTRATION_ID_INVALID }) 
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
export const getDonationRequestProcessesController = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.query

  if (!user_id || !ObjectId.isValid(user_id as string)) {
    res.status(400).json({ message: DONATION_MESSAGES.USERID_IS_INVALID }) 
    return
  }

  const donationRequestsProcess = await donationService.getDonationRequestProcesses()
  const userDonationRequestsProcess = donationRequestsProcess.filter((donation: any) => {
    return donation.userId.toString() === user_id
  })

  res.status(200).json({
    message: DONATION_MESSAGES.GET_DONATION_REQUEST_PROCESS_SUCCESS,
    result: userDonationRequestsProcess
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



export const updateDonationRequestProcessController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params
  const { status, volumeCollected, donationDate, description } = req.body

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_ID_INVALID })
    return
  }

  const updatedProcess = await donationService.updateDonationRequestProcess(id, {
    status,
    volumeCollected,
    donationDate: donationDate ? new Date(donationDate) : undefined,
    description
  })

  if (!updatedProcess) {
    res.status(404).json({ message: DONATION_MESSAGES.DONATION_REQUEST_PROCESS_NOT_FOUND })
    return
  }

  res.status(200).json({
    message: DONATION_MESSAGES.UPDATE_DONATION_REQUEST_PROCESS_SUCCESS,
    result: updatedProcess
  })
}