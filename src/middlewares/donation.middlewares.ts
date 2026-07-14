import { checkSchema, ParamSchema } from 'express-validator'
import { DonationProcessStatus, DonationRegistrationStatus, DonationType, UserGender, UserRole } from '~/constants/enum'
import { BLOOD_MESSAGES, DONATION_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/User.requests'
import bloodService from '~/services/blood.services'
import usersService from '~/services/user.services'
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
        },
        custom: {
          options: (value) => {
            const inputDate = new Date(value)
            const now = new Date()

            if (inputDate < now) {
              throw new Error(DONATION_MESSAGES.START_DATE_DONATION_CANNOT_BE_IN_PAST)
            }
            return true
          }
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
      },
      phone: {
        isString: {
          errorMessage: USER_MESSAGES.PHONE_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 10,
            max: 12
          },
          errorMessage: USER_MESSAGES.PHONE_IS_WRONG_FORMAT
        },
        custom: {
          options: async (value) => {
            const isExistPhone = await usersService.checkPhoneExist(value)
            if (isExistPhone) {
              throw new Error(USER_MESSAGES.PHONE_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      gender: {
        isIn: {
          options: [Object.values(UserGender)],
          errorMessage: USER_MESSAGES.GENDER_MUST_BE_ONE_OF_THE_FOLLOWING_VALUES
        },
        optional: true
      },
      citizen_id_number: {
        notEmpty: {
          errorMessage: USER_MESSAGES.CITIZEN_ID_NUMBER_IS_REQUIRED
        },
        isLength: {
          options: { min: 12, max: 12 },
          errorMessage: USER_MESSAGES.CITIZEN_ID_MUST_BE_EXACTLY_12_DIGITS
        },
        matches: {
          options: [/^\d{12}$/],
          errorMessage: USER_MESSAGES.CITIZEN_ID_MUST_CONTAIN_ONLY_DIGITS_0_9
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistCitizen = await usersService.checkCitizenIDNumber(value)
            if (isExistCitizen) {
              throw new Error(USER_MESSAGES.CITIZEN_ID_NUMBER_ALREADY_EXIST)
            }
            return true
          }
        }
      },
      full_name: {
        isString: {
          errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_50
        },
        trim: true
      },
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: { strict: true },
          errorMessage: DONATION_MESSAGES.START_DATE_DONATION_IS_INVALID
        },
        custom: {
          options: (value) => {
            const inputDate = new Date(value)
            const now = new Date()

            if (inputDate > now) {
              throw new Error(USER_MESSAGES.DATE_OF_BIRTH_CANNOT_IN_THE_FUTURE)
            }
            return true
          }
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
              throw new Error(BLOOD_MESSAGES.BLOOD_GROUP_NOT_FOUND)
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
        },
        custom: {
          options: (value) => {
            const inputDate = new Date(value)
            const now = new Date()

            if (inputDate < now) {
              throw new Error(DONATION_MESSAGES.START_DATE_DONATION_CANNOT_BE_IN_PAST)
            }
            return true
          }
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
        },
        custom: {
          options: (value: string, { req }) => {
            const { role } = req.decode_authorization as TokenPayload

            if (value === DonationRegistrationStatus.CheckedIn && role === UserRole.Customer) {
              throw new Error(DONATION_MESSAGES.CUSTOMER_CANNOT_CHECK_IN)
            }

            return true
          }
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
