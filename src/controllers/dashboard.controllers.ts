import { DASHBOARD_MESSAGES } from './../constants/messages'
import { Request, Response } from 'express'
import dashboardService from '~/services/dashboard.services'

export const getAllDonationNumberController = async (req: Request, res: Response) => {
  const donationCount = await dashboardService.getAllDonationCount()
  res.json({
    message: DASHBOARD_MESSAGES.GET_ALL_DONATION_NUMBER_SUCCESS,
    result: donationCount
  })
}

export const getAllRequestNumberController = async (req: Request, res: Response) => {
  const requestCount = await dashboardService.getAllRequestCount()
  res.json({
    message: DASHBOARD_MESSAGES.GET_ALL_REQUEST_NUMBER_SUCCESS,
    result: requestCount
  })
}

export const getAllUserNumberController = async (req: Request, res: Response) => {
  const userCount = await dashboardService.getAllUserCount()
  res.json({
    message: DASHBOARD_MESSAGES.GET_ALL_USER_NUMBER_SUCCESS,
    result: userCount
  })
}

export const getBloodStockSummaryController = async (req: Request, res: Response) => {
  const bloodStockSummary = await dashboardService.getBloodStockSummary()
  res.json({
    message: DASHBOARD_MESSAGES.GET_BLOOD_STOCK_SUMMARY_SUCCESS,
    result: bloodStockSummary
  })
}

export const getBloodStorageSummaryController = async (req: Request, res: Response) => {
  const bloodStorageSummary = await dashboardService.getBloodStorageSummary()
  res.json({
    message: DASHBOARD_MESSAGES.GET_BLOOD_STORAGE_SUMMARY_SUCCESS,
    result: bloodStorageSummary
  })
}
