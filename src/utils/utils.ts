import { BloodComponentEnum } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { HEALTH_CHECK_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'

export const calculateDonationVolume = (weight: number) => {
  if (weight < 42) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: HEALTH_CHECK_MESSAGES.THE_MINIUM_WEIGHT_REQUIRED_TO_DONATION_BLOOD_IS_42KG
    })
  }

  const volume = weight * 8
  return Math.min(volume, 450)
}

export const getExpirationDateByComponent = (componentName: BloodComponentEnum): Date => {
  const now = new Date()

  const componentExpiryDays: Record<BloodComponentEnum, number> = {
    [BloodComponentEnum.RedBloodCells]: 42,
    [BloodComponentEnum.Platelets]: 5,
    [BloodComponentEnum.Plasma]: 365,
    [BloodComponentEnum.WhiteBloodCells]: 1, // not use
    [BloodComponentEnum.WholeBlood]: 35 // note use
  }

  const days = componentExpiryDays[componentName] ?? 30
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
}
