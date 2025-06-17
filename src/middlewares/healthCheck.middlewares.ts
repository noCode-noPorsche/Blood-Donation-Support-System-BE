import { checkSchema, ParamSchema } from 'express-validator'
import { HealthCheckStatus, UnderlyingHealthCondition } from '~/constants/enum'
import { BLOOD_MESSAGES, HEALTH_CHECK_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

const bloodGroupSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_IS_REQUIRED
  },
  isString: {
    errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_MUST_BE_A_STRING
  }
  // isIn: {
  //   options: [Object.values(BloodGroupEnum)],
  //   errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_IS_INVALID
  // }
}

export const updateHealthCheckValidator = validate(
  checkSchema(
    {
      blood_group_id: bloodGroupSchema,
      weight: {
        notEmpty: {
          errorMessage: HEALTH_CHECK_MESSAGES.WEIGHT_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: HEALTH_CHECK_MESSAGES.WEIGHT_MUST_BE_A_NUMBER
        },
        isFloat: {
          options: { min: 0 },
          errorMessage: HEALTH_CHECK_MESSAGES.WEIGHT_MUST_BE_POSITIVE
        },
        toFloat: true
      },
      temperature: {
        notEmpty: {
          errorMessage: HEALTH_CHECK_MESSAGES.TEMPERATURE_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: HEALTH_CHECK_MESSAGES.TEMPERATURE_MUST_BE_A_NUMBER
        },
        isFloat: {
          options: { min: 0 },
          errorMessage: HEALTH_CHECK_MESSAGES.TEMPERATURE_MUST_BE_POSITIVE
        },
        toFloat: true
      },
      heart_rate: {
        notEmpty: {
          errorMessage: HEALTH_CHECK_MESSAGES.HEART_RATE_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: HEALTH_CHECK_MESSAGES.HEART_RATE_MUST_BE_A_NUMBER
        },
        isInt: {
          options: { min: 0 },
          errorMessage: HEALTH_CHECK_MESSAGES.HEART_RATE_MUST_BE_POSITIVE
        },
        toInt: true
      },
      diastolic_blood_pressure: {
        notEmpty: {
          errorMessage: HEALTH_CHECK_MESSAGES.DIASTOLIC_BLOOD_PRESSURE_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: HEALTH_CHECK_MESSAGES.DIASTOLIC_BLOOD_PRESSURE_MUST_BE_A_NUMBER
        },
        isInt: {
          options: { min: 0 },
          errorMessage: HEALTH_CHECK_MESSAGES.DIASTOLIC_BLOOD_PRESSURE_MUST_BE_POSITIVE
        },
        toInt: true
      },
      systolic_blood_pressure: {
        notEmpty: {
          errorMessage: HEALTH_CHECK_MESSAGES.SYSTOLIC_BLOOD_PRESSURE_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: HEALTH_CHECK_MESSAGES.SYSTOLIC_BLOOD_PRESSURE_MUST_BE_A_NUMBER
        },
        isInt: {
          options: { min: 0 },
          errorMessage: HEALTH_CHECK_MESSAGES.SYSTOLIC_BLOOD_PRESSURE_MUST_BE_POSITIVE
        },
        toInt: true
      },
      hemoglobin: {
        notEmpty: {
          errorMessage: HEALTH_CHECK_MESSAGES.HEMOGLOBIN_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: HEALTH_CHECK_MESSAGES.HEMOGLOBIN_MUST_BE_A_NUMBER
        },
        isFloat: {
          options: { min: 0 },
          errorMessage: HEALTH_CHECK_MESSAGES.HEMOGLOBIN_MUST_BE_POSITIVE
        },
        toFloat: true
      },
      status: {
        notEmpty: {
          errorMessage: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_STATUS_IS_REQUIRED
        },
        isString: {
          errorMessage: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [Object.values(HealthCheckStatus)],
          errorMessage: HEALTH_CHECK_MESSAGES.HEALTH_CHECK_STATUS_MUST_BE_ONE_OF_THE_FOLLOWING_VALUES
        }
      },
      description: {
        notEmpty: undefined,
        optional: true,
        isString: {
          errorMessage: HEALTH_CHECK_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 500 },
          errorMessage: HEALTH_CHECK_MESSAGES.DESCRIPTION_LENGTH_MUST_BE_LESS_THAN_500
        }
      },
      underlying_health_condition: {
        notEmpty: undefined,
        optional: true,
        isArray: {
          errorMessage: HEALTH_CHECK_MESSAGES.UNDERLYING_CONDITIONS_MUST_BE_AN_ARRAY
        },
        custom: {
          options: (value: UnderlyingHealthCondition[]) => {
            const allowedValues = Object.values(UnderlyingHealthCondition)
            const isValid = Array.isArray(value) && value.every((item) => allowedValues.includes(item))
            if (!isValid) {
              throw new Error(HEALTH_CHECK_MESSAGES.UNDERLYING_CONDITIONS_INVALID_VALUES)
            }
            return true
          }
        }
      }
    },

    ['body']
  )
)
