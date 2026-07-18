import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { BloodUnitStatus } from '~/constants/enum'
import { BLOOD_MESSAGES } from '~/constants/messages'
import {
  BloodUnitsFilter,
  GetAllBloodUnitsQuery,
  GetAllBloodUnitsRelativeQuery,
  GetAllBloodUnitsRelativeReqParams,
  GetBloodUnitsByDonationProcessIdQuery,
  GetBloodUnitsByDonationProcessIdReqParams,
  UpdateBloodUnitsByDonationProcessIdReqParams,
  UpdateBloodUnitsFromDonationReqBody,
  UpdateStatusBloodUnitsReqBody
} from '~/models/requests/BloodUnit.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bloodUnitService from '~/services/bloodUnit.services'

// Cập nhật Blood Unit From Donation Process
export const updateBloodUnitsFromDonationProcessController = async (
  req: Request<UpdateBloodUnitsByDonationProcessIdReqParams, any, UpdateBloodUnitsFromDonationReqBody[]>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req

  const result = await bloodUnitService.updateBloodUnitsFromDonationProcess({ id, payload: body, user_id })
  res.sendSuccess?.(BLOOD_MESSAGES.UPDATE_BLOOD_UNITS_SUCCESS, result)
}

// Lấy danh sách Blood Unit By Donation Process Id
export const getBloodUnitByDonationProcessIdController = async (
  req: Request<GetBloodUnitsByDonationProcessIdReqParams, any, any, GetBloodUnitsByDonationProcessIdQuery>,
  res: Response
) => {
  const filter: BloodUnitsFilter = {}

  const { id } = req.params
  const { blood_component_id, status } = req.query
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  if (blood_component_id !== undefined) {
    filter.blood_component_id = new ObjectId(blood_component_id)
  }

  if (
    status !== undefined &&
    typeof status === 'string' &&
    Object.values(BloodUnitStatus).includes(status as BloodUnitStatus)
  ) {
    filter.status = status
  }

  const result = await bloodUnitService.getBloodUnitsByDonationProcessId({ id, filter, limit, page })
  res.sendSuccess?.(BLOOD_MESSAGES.GET_BLOOD_UNITS_SUCCESS, result)
}

// Lấy danh sách Blood Unit
export const getAllBloodUnitsController = async (
  req: Request<ParamsDictionary, any, any, GetAllBloodUnitsQuery>,
  res: Response
) => {
  const filter: BloodUnitsFilter = {}

  const { blood_component_id, status, blood_group_id, volume } = req.query
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  if (blood_component_id !== undefined) {
    filter.blood_component_id = new ObjectId(blood_component_id)
  }

  if (blood_group_id !== undefined) {
    filter.blood_group_id = new ObjectId(blood_group_id)
  }

  if (volume !== undefined) {
    filter.volume = Number(volume)
  }

  if (
    status !== undefined &&
    typeof status === 'string' &&
    Object.values(BloodUnitStatus).includes(status as BloodUnitStatus)
  ) {
    filter.status = status
  }

  const result = await bloodUnitService.getAllBloodUnits({ filter, limit, page })
  res.sendSuccess?.(BLOOD_MESSAGES.GET_BLOOD_UNITS_SUCCESS, result)
}

// Lấy danh sách Blood Unit Relative
export const getAllBloodUnitsRelativeController = async (
  req: Request<GetAllBloodUnitsRelativeReqParams, any, any, GetAllBloodUnitsRelativeQuery>,
  res: Response
) => {
  const { blood_group_id, blood_component_ids } = req.params
  const filter: BloodUnitsFilter = {}

  const { volume } = req.query
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  if (volume !== undefined) {
    filter.volume = Number(volume)
  }

  const result = await bloodUnitService.getAllBloodUnitsRelative({
    blood_group_id,
    blood_component_ids: blood_component_ids.split('-'), //chuyển thành mảng
    filter,
    limit,
    page
  })
  res.sendSuccess?.(BLOOD_MESSAGES.GET_BLOOD_UNITS_SUCCESS, result)
}

// Cập nhật Status Blood Unit
export const updateStatusBloodUnitsController = async (
  req: Request<UpdateBloodUnitsByDonationProcessIdReqParams, any, UpdateStatusBloodUnitsReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req

  const result = await bloodUnitService.updateStatusBloodUnits({ id, payload: body, user_id })
  res.sendSuccess?.(BLOOD_MESSAGES.UPDATE_BLOOD_UNITS_STATUS_SUCCESS, { result })
}
