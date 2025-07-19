import { validate } from '~/utils/validation'
import { checkSchema, ParamSchema } from 'express-validator'
import { BloodComponentEnum, BloodGroupEnum, BloodUnitStatus } from '~/constants/enum'
import { BLOOD_MESSAGES } from '~/constants/messages'

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

const bloodComponentSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_IS_REQUIRED
  },
  isString: {
    errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_MUST_BE_A_STRING
  }
  // isIn: {
  //   options: [Object.values(BloodComponentEnum)],
  //   errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_IS_INVALID
  // }
}

export const createBloodUnitValidation = validate(
  checkSchema(
    {
      blood_group_id: bloodGroupSchema,
      blood_component_id: bloodComponentSchema,
      volume: {
        notEmpty: {
          errorMessage: BLOOD_MESSAGES.VOLUME_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: BLOOD_MESSAGES.VOLUME_MUST_BE_A_NUMBER
        },
        isInt: {
          options: { min: 1 },
          errorMessage: BLOOD_MESSAGES.VOLUME_MUST_BE_POSITIVE
        },
        toInt: true
      }
    },
    ['body']
  )
)

export const updateBloodUnitsValidation = validate(
  checkSchema(
    {
      blood_group_id: bloodGroupSchema,
      blood_component_id: bloodComponentSchema,
      volume: {
        notEmpty: {
          errorMessage: BLOOD_MESSAGES.VOLUME_IS_REQUIRED
        },
        isNumeric: {
          errorMessage: BLOOD_MESSAGES.VOLUME_MUST_BE_A_NUMBER
        },
        isInt: {
          options: { min: 1 },
          errorMessage: BLOOD_MESSAGES.VOLUME_MUST_BE_POSITIVE
        },
        toInt: true
      },
      status: {
        notEmpty: {
          errorMessage: BLOOD_MESSAGES.BLOOD_UNIT_STATUS_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOOD_MESSAGES.BLOOD_UNIT_STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [Object.values(BloodUnitStatus)],
          errorMessage: BLOOD_MESSAGES.BLOOD_UNIT_STATUS_MUST_BE_ONE_OF_THE_FOLLOWING_VALUES
        }
      }
    },
    ['body']
  )
)

export const updateStatusBloodUnitsValidation = validate(
  checkSchema(
    {
      status: {
        notEmpty: {
          errorMessage: BLOOD_MESSAGES.BLOOD_UNIT_STATUS_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOOD_MESSAGES.BLOOD_UNIT_STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [[BloodUnitStatus.Expired, BloodUnitStatus.Damaged]], // chỉ cho phép 2 giá trị này
          errorMessage: BLOOD_MESSAGES.BLOOD_UNIT_STATUS_MUST_BE_ONE_OF_THE_FOLLOWING_VALUES
        }
      }
    },
    ['body']
  )
)
