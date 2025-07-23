import { checkSchema, ParamSchema } from 'express-validator'
import { DonationProcessStatus, DonationRegistrationStatus, DonationType } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { BLOOD_MESSAGES, DONATION_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import bloodService from '~/services/blood.services'
import { validate } from '~/utils/validation'

const bloodGroupSchema: ParamSchema = {
  // notEmpty: {
  //   errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_IS_REQUIRED
  // },
  notEmpty: undefined
  // isString: {
  //   errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_MUST_BE_A_STRING
  // }
  // isIn: {
  //   options: [Object.values(BloodGroupEnum)],
  //   errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_IS_INVALID
  // }
}

const bloodComponentSchema: ParamSchema = {
  // notEmpty: {
  //   errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_IS_REQUIRED
  // },
  notEmpty: undefined
  // isString: {
  //   errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_MUST_BE_A_STRING
  // }
  // isIn: {
  //   options: [Object.values(BloodComponentEnum)],
  //   errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_IS_INVALID
  // }
}

export const createDonationValidator = validate(
  checkSchema(
    {
      blood_group_id: bloodGroupSchema,
      start_date_donation: {
        notEmpty: {
          errorMessage: DONATION_MESSAGES.START_DATE_DONATION_IS_REQUIRED
        },
        isISO8601: {
          options: { strict: true },
          errorMessage: DONATION_MESSAGES.START_DATE_DONATION_IS_INVALID
        }
      },
      donation_type: {
        notEmpty: {
          errorMessage: DONATION_MESSAGES.DONATION_TYPE_IS_REQUIRED
        },
        isIn: {
          options: [Object.values(DonationType)],
          errorMessage: DONATION_MESSAGES.DONATION_TYPE_IS_INVALID
        }
      }
    },
    ['body']
  )
)

// export const updateStatusDonationRegistrationValidator = validate(
//   checkSchema(
//     {
//       status: {
//         notEmpty: {
//           errorMessage: DONATION_MESSAGES.STATUS_IS_REQUIRED
//         },
//         isString: {
//           errorMessage: DONATION_MESSAGES.STATUS_MUST_BE_A_STRING
//         },
//         isIn: {
//           options: [Object.values(DonationRegistrationStatus)],
//           errorMessage: DONATION_MESSAGES.STATUS_IS_INVALID
//         }
//       }
//     },
//     ['body']
//   )
// )

export const updateDonationRegistrationValidator = validate(
  checkSchema(
    {
      blood_group_id: {
        optional: true,
        custom: {
          options: async (value: string) => {
            const isBloodGroupExist = await bloodService.isBloodGroupIdExist(value)
            if (!isBloodGroupExist) {
              throw new ErrorWithStatus({
                message: BLOOD_MESSAGES.BLOOD_GROUP_NOT_FOUND,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
          }
        }
      },
      start_date_donation: {
        notEmpty: undefined,
        optional: true,
        isISO8601: {
          options: { strict: true },
          errorMessage: DONATION_MESSAGES.START_DATE_DONATION_IS_INVALID
        }
      },
      status: {
        // notEmpty: {
        //   errorMessage: DONATION_MESSAGES.STATUS_IS_REQUIRED
        // },
        optional: true,
        isString: {
          errorMessage: DONATION_MESSAGES.STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [Object.values(DonationRegistrationStatus)],
          errorMessage: DONATION_MESSAGES.STATUS_IS_INVALID
        }
      },
      donation_type: {
        // notEmpty: {
        //   errorMessage: DONATION_MESSAGES.DONATION_TYPE_IS_REQUIRED
        // },
        optional: true,
        isIn: {
          options: [Object.values(DonationType)],
          errorMessage: DONATION_MESSAGES.DONATION_TYPE_IS_INVALID
        }
      }
    },
    ['body']
  )
)

export const updateDonationProcessValidator = validate(
  checkSchema(
    {
      status: {
        notEmpty: {
          errorMessage: DONATION_MESSAGES.STATUS_IS_REQUIRED
        },
        isString: {
          errorMessage: DONATION_MESSAGES.STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [Object.values(DonationProcessStatus)],
          errorMessage: DONATION_MESSAGES.STATUS_IS_INVALID
        }
      },
      volume_collected: {
        notEmpty: {
          errorMessage: DONATION_MESSAGES.VOLUME_COLLECTED_IS_REQUIRED
        },
        isInt: {
          options: { min: 0, max: 450 },
          errorMessage: DONATION_MESSAGES.VOLUME_COLLECTED_MUST_BE_A_NUMBER_BETWEEN_250_AND_450
        },
        toInt: true
      },
      donation_date: {
        optional: true,
        isISO8601: {
          options: { strict: true },
          errorMessage: DONATION_MESSAGES.DONATION_DATE_IS_INVALID
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: DONATION_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
        },
        isLength: {
          options: { max: 500 },
          errorMessage: DONATION_MESSAGES.DESCRIPTION_LENGTH_MUST_BE_LESS_THAN_500
        }
      }
    },
    ['body']
  )
)
