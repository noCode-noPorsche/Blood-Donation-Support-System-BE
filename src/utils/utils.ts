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
