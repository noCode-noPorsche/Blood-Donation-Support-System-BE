import { checkSchema } from 'express-validator'
import { RequestProcessStatus, RequestRegistrationStatus, RequestType } from '~/constants/enum'
import { REQUEST_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import usersService from '~/services/user.services'
import { validate } from '~/utils/validation'

export const createRequestRegistrationValidator = validate(
  checkSchema(
    {
      blood_group_id: {
        notEmpty: undefined
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
        trim: true
        // custom: {
        //   options: async (value) => {
        //     const isExistCitizen = await usersService.checkCitizenIDNumber(value)
        //     if (isExistCitizen) {
        //       throw new Error(USER_MESSAGES.CITIZEN_ID_NUMBER_ALREADY_EXIST)
        //     }
        //     return true
        //   }
        // }
      },
      receive_date_request: {
        notEmpty: {
          errorMessage: REQUEST_MESSAGES.RECEIVE_DATE_REQUEST_IS_REQUIRED
        },
        isISO8601: {
          options: { strict: true },
          errorMessage: REQUEST_MESSAGES.RECEIVE_DATE_REQUEST_IS_INVALID
        }
      },
      is_emergency: {
        notEmpty: {
          errorMessage: REQUEST_MESSAGES.IS_EMERGENCY_IS_REQUIRED
        },
        isBoolean: {
          errorMessage: REQUEST_MESSAGES.IS_EMERGENCY_IS_INVALID
        }
      },
      request_type: {
        // notEmpty: {
        //   errorMessage: DONATION_MESSAGES.DONATION_TYPE_IS_REQUIRED
        // },
        optional: true,
        isIn: {
          options: [Object.values(RequestType)],
          errorMessage: REQUEST_MESSAGES.REQUEST_TYPE_IS_INVALID
        }
      },
      full_name: {
        notEmpty: undefined
      },
      phone: {
        // notEmpty: {
        //   errorMessage: USER_MESSAGES.PHONE_IS_REQUIRED
        // },
        optional: true,
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
      image: {
        notEmpty: undefined
      },
      note: {
        notEmpty: undefined
      }
    },
    ['body']
  )
)

export const updateRequestRegistrationValidator = validate(
  checkSchema(
    {
      blood_group_id: {
        notEmpty: undefined
      },
      status: {
        notEmpty: {
          errorMessage: REQUEST_MESSAGES.STATUS_IS_REQUIRED
        },
        isString: {
          errorMessage: REQUEST_MESSAGES.STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [Object.values(RequestRegistrationStatus)],
          errorMessage: REQUEST_MESSAGES.STATUS_IS_INVALID
        }
      },
      receive_date_request: {
        // notEmpty: {
        //   errorMessage: REQUEST_MESSAGES.RECEIVE_DATE_REQUEST_IS_REQUIRED
        // },
        notEmpty: undefined,

        isISO8601: {
          options: { strict: true },
          errorMessage: REQUEST_MESSAGES.RECEIVE_DATE_REQUEST_IS_INVALID
        }
      },
      is_emergency: {
        // notEmpty: {
        //   errorMessage: REQUEST_MESSAGES.IS_EMERGENCY_IS_REQUIRED
        // },
        notEmpty: undefined,

        isBoolean: {
          errorMessage: REQUEST_MESSAGES.IS_EMERGENCY_IS_INVALID
        }
      },
      request_type: {
        // optional: true,
        notEmpty: {
          errorMessage: REQUEST_MESSAGES.REQUEST_TYPE_IS_REQUIRED
        },
        isIn: {
          options: [Object.values(RequestType)],
          errorMessage: REQUEST_MESSAGES.REQUEST_TYPE_IS_INVALID
        }
      },
      image: {
        notEmpty: undefined
      },
      note: {
        notEmpty: undefined
      },
      full_name: {
        notEmpty: undefined
      },
      phone: {
        notEmpty: undefined
      },
      citizen_id_number: {
        // notEmpty: {
        //   errorMessage: USER_MESSAGES.CITIZEN_ID_NUMBER_IS_REQUIRED
        // },
        // notEmpty: undefined,
        optional: true,
        isLength: {
          options: { min: 12, max: 12 },
          errorMessage: USER_MESSAGES.CITIZEN_ID_MUST_BE_EXACTLY_12_DIGITS
        },
        matches: {
          options: [/^\d{12}$/],
          errorMessage: USER_MESSAGES.CITIZEN_ID_MUST_CONTAIN_ONLY_DIGITS_0_9
        },
        trim: true
        // custom: {
        //   options: async (value) => {
        //     const isExistCitizen = await usersService.checkCitizenIDNumber(value)
        //     if (isExistCitizen) {
        //       throw new Error(USER_MESSAGES.CITIZEN_ID_NUMBER_ALREADY_EXIST)
        //     }
        //     return true
        //   }
        // }
      }
    },
    ['body']
  )
)

export const updateRequestProcessValidator = validate(
  checkSchema(
    {
      status: {
        notEmpty: {
          errorMessage: REQUEST_MESSAGES.STATUS_IS_REQUIRED
        },
        isString: {
          errorMessage: REQUEST_MESSAGES.STATUS_MUST_BE_A_STRING
        },
        isIn: {
          options: [Object.values(RequestProcessStatus)],
          errorMessage: REQUEST_MESSAGES.STATUS_IS_INVALID
        }
      },
      blood_group_id: {
        notEmpty: undefined
      },
      description: {
        notEmpty: undefined
      },
      volume_received: {
        isNumeric: {
          errorMessage: REQUEST_MESSAGES.VOLUME_RECEIVED_MUST_BE_A_NUMBER
        },
        isInt: {
          options: { min: 0 },
          errorMessage: REQUEST_MESSAGES.VOLUME_RECEIVED_MUST_BE_POSITIVE
        },
        toInt: true
      },
      is_emergency: {
        notEmpty: {
          errorMessage: REQUEST_MESSAGES.IS_EMERGENCY_IS_REQUIRED
        },
        isBoolean: {
          errorMessage: REQUEST_MESSAGES.IS_EMERGENCY_IS_INVALID
        }
      },
      request_date: {
        notEmpty: {
          errorMessage: REQUEST_MESSAGES.REQUEST_DATE_IS_REQUIRED
        },
        isISO8601: {
          options: { strict: true },
          errorMessage: REQUEST_MESSAGES.REQUEST_DATE_IS_INVALID
        }
      }
    },
    ['body']
  )
)
