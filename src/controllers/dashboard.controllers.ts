import { DASHBOARD_MESSAGES } from './../constants/messages'
import { Request, Response } from 'express'
import dashboardService from '~/services/dashboard.services'

export const getAllDonationNumberController = async (req: Request, res: Response) => {
  const result = await dashboardService.getAllDonationCount()
  res.sendSuccess?.(DASHBOARD_MESSAGES.GET_ALL_DONATION_NUMBER_SUCCESS, { result })
}

export const getAllRequestNumberController = async (req: Request, res: Response) => {
  const result = await dashboardService.getAllRequestCount()
  res.sendSuccess?.(DASHBOARD_MESSAGES.GET_ALL_REQUEST_NUMBER_SUCCESS, { result })
}

export const getAllUserNumberController = async (req: Request, res: Response) => {
  const result = await dashboardService.getAllUserCount()
  res.sendSuccess?.(DASHBOARD_MESSAGES.GET_ALL_USER_NUMBER_SUCCESS, { result })
}

export const getBloodStockSummaryController = async (req: Request, res: Response) => {
  const result = await dashboardService.getBloodStockSummary()
  res.sendSuccess?.(DASHBOARD_MESSAGES.GET_BLOOD_STOCK_SUMMARY_SUCCESS, { result })
}

export const getBloodStorageSummaryController = async (req: Request, res: Response) => {
  const result = await dashboardService.getBloodStorageSummary()
  res.sendSuccess?.(DASHBOARD_MESSAGES.GET_BLOOD_STORAGE_SUMMARY_SUCCESS, { result })
}

export const getDashboardAdminOverviewController = async (req: Request, res: Response) => {
  const result = await dashboardService.getDashboardAdminOverview()
  res.sendSuccess?.(DASHBOARD_MESSAGES.GET_DASHBOARD_OVERVIEW_SUCCESS, { result })
}

export const getDashboardWarehouseOverviewController = async (req: Request, res: Response) => {
  const result = await dashboardService.getDashboardWarehouseOverview()
  res.sendSuccess?.(DASHBOARD_MESSAGES.GET_DASHBOARD_OVERVIEW_SUCCESS, { result })
}
