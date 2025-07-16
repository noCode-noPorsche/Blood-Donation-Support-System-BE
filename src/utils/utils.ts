import { BloodComponentEnum, DonationType } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { HEALTH_CHECK_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import bloodService from '~/services/blood.services'

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
    [BloodComponentEnum.WholeBlood]: 35 // not use
  }

  const days = componentExpiryDays[componentName] ?? 30
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
}

export const isCompatibleDonor = async (receiverGroupId: string, donorGroupId: string): Promise<boolean> => {
  const bloodGroupMap: Record<string, string[]> = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  }

  const receiverName = await bloodService.getBloodGroupNameById(receiverGroupId)
  const donorName = await bloodService.getBloodGroupNameById(donorGroupId)

  if (!receiverName) {
    throw new Error(`Blood group not found for receiverGroupId: ${receiverGroupId}`)
  }

  if (!donorName) {
    throw new Error(`Blood group not found for donorGroupId: ${donorGroupId}`)
  }

  return bloodGroupMap[receiverName]?.includes(donorName)
}

export const bloodGroupMap: Record<string, string[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
}

export const convertTypeToComponentMap: Record<DonationType, BloodComponentEnum[]> = {
  [DonationType.WholeBlood]: [
    BloodComponentEnum.Platelets,
    BloodComponentEnum.Plasma,
    BloodComponentEnum.RedBloodCells
  ],
  [DonationType.Platelets]: [BloodComponentEnum.Platelets],
  [DonationType.Plasma]: [BloodComponentEnum.Plasma],
  [DonationType.RedBloodCells]: [BloodComponentEnum.RedBloodCells],
  [DonationType.PlateletsPlasma]: [BloodComponentEnum.Platelets, BloodComponentEnum.Plasma],
  [DonationType.PlasmaRedCells]: [BloodComponentEnum.Plasma, BloodComponentEnum.RedBloodCells],
  [DonationType.PlateletsRedCells]: [BloodComponentEnum.Platelets, BloodComponentEnum.RedBloodCells]
}
