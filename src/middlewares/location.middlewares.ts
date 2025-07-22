import { checkSchema } from 'express-validator'
import { BloodGroupEnum } from '~/constants/enum'
import { LOCATION_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'
import { BLOOD_MESSAGES } from './../constants/messages'

export const findCompatibleDonorsNearbyValidator = validate(
  checkSchema(
    {
      radiusKm: {
        notEmpty: {
          errorMessage: LOCATION_MESSAGES.RADIUS_KM_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: LOCATION_MESSAGES.RADIUS_KM_MUST_BE_A_NUMBER
        },
        isFloat: {
          options: { min: 0.1 },
          errorMessage: LOCATION_MESSAGES.RADIUS_KM_MUST_BE_POSITIVE
        },
        toFloat: true
      },
      blood_group_name: {
        isString: {
          errorMessage: LOCATION_MESSAGES.BLOOD_GROUP_NAME_MUST_BE_A_STRING
        },
        custom: {
          options: (value) => {
            const validValues = Object.values(BloodGroupEnum)
            if (!validValues.includes(value)) {
              throw new Error(BLOOD_MESSAGES.BLOOD_GROUP_IS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
