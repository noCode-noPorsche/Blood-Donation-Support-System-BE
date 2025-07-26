import { checkSchema, ParamSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { add, capitalize } from 'lodash'
import { Request } from 'express'
import { validate } from '~/utils/validation'
import usersService from '~/services/user.services'
import { ErrorWithStatus } from '~/models/Error'
import { UserGender, UserRole } from '~/constants/enum'
import { TokenPayload } from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  }
}

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

const fullNameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
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
}

const phoneSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PHONE_IS_REQUIRED
  },
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
  },
  trim: true
}

const genderSchema: ParamSchema = {
  isIn: {
    options: [Object.values(UserGender)],
    errorMessage: USER_MESSAGES.GENDER_MUST_BE_ONE_OF_THE_FOLLOWING_VALUES
  },
  optional: true
}

export const loginValidator = validate(
  checkSchema(
    {
      phone: {
        notEmpty: {
          errorMessage: USER_MESSAGES.PHONE_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.PHONE_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              phone: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USER_MESSAGES.PHONE_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      full_name: fullNameSchema,
      phone: phoneSchema,
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
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
      address: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.ADDRESS_MUST_BE_A_STRING
        }
        // isLength: {
        //   options: {
        //     min: 1,
        //     max: 200
        //   },
        //   errorMessage: USER_MESSAGES.ADDRESS_LENGTH_MUST_BE_LESS_THAN_200
        // }
      },
      gender: genderSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const registerForAdminValidator = validate(
  checkSchema(
    {
      full_name: fullNameSchema,
      phone: phoneSchema,
      email: {
        // notEmpty: {
        //   errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        // },
        optional: true,
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
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
      role: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ROLE_IS_REQUIRED
        },
        isIn: {
          options: [[UserRole.Staff, UserRole.StaffWarehouse, UserRole.Customer]],
          errorMessage: USER_MESSAGES.ROLE_IS_INVALID
        }
      },
      address: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.ADDRESS_MUST_BE_A_STRING
        }
        // isLength: {
        //   options: {
        //     min: 1,
        //     max: 200
        //   },
        //   errorMessage: USER_MESSAGES.ADDRESS_LENGTH_MUST_BE_LESS_THAN_200
        // }
      },
      gender: genderSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const changeRoleForAdminValidator = validate(
  checkSchema(
    {
      role: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ROLE_IS_REQUIRED
        },
        isIn: {
          options: [[UserRole.Staff, UserRole.StaffWarehouse, UserRole.Customer]],
          errorMessage: USER_MESSAGES.ROLE_IS_INVALID
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              const user_id = decode_authorization.user_id
              const user = await databaseService.users.findOne({
                _id: new ObjectId(user_id)
              })

              if (!user) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              if (!user.is_active) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_IS_DISABLED,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              ;(req as Request).decode_authorization = decode_authorization
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decode_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
                }),
                databaseService.refreshToken.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decode_refresh_token = decode_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateMeValidator = validate(
  checkSchema(
    {
      full_name: { ...fullNameSchema, optional: true, notEmpty: undefined, trim: true },
      date_of_birth: { ...dateOfBirthSchema, optional: true, notEmpty: undefined },
      gender: { ...genderSchema, optional: true, notEmpty: undefined },
      weight: {
        notEmpty: undefined,
        isNumeric: {
          errorMessage: USER_MESSAGES.WEIGHT_MUST_BE_A_NUMBER
        },
        isFloat: {
          options: { min: 1, max: 500 },
          errorMessage: USER_MESSAGES.WEIGHT_MUST_BE_AN_INTEGER_BETWEEN_1_AND_500
        },
        optional: true,
        toFloat: true
      },
      blood_group: {
        notEmpty: undefined,
        isString: {
          errorMessage: USER_MESSAGES.BLOOD_GROUP_MUST_BE_A_STRING
        },
        optional: true
      },
      avatar_url: {
        optional: true,
        notEmpty: undefined,
        isString: {
          errorMessage: USER_MESSAGES.AVATAR_MUST_BE_A_STRING
        },
        isURL: {
          errorMessage: USER_MESSAGES.AVATAR_MUST_BE_A_URL
        },
        trim: true
      },
      address: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.ADDRESS_MUST_BE_A_STRING
        }
        // isLength: {
        //   options: {
        //     min: 1,
        //     max: 200
        //   },
        //   errorMessage: USER_MESSAGES.ADDRESS_LENGTH_MUST_BE_LESS_THAN_200
        // }
      }
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decode_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
            if (user === null) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            if (user.password !== hashPassword(value)) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.OLD_PASSWORD_NOT_MATCH,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

// export const changeIsActiveValidator = validate(
//   checkSchema(
//     {
//       is_active: {
//         notEmpty: {
//           errorMessage: USER_MESSAGES.IS_ACTIVE_IS_REQUIRED
//         },
//         isBoolean: {
//           errorMessage: USER_MESSAGES.IS_ACTIVE_MUST_BE_BOOLEAN
//         },
//         toBoolean: true
//       }
//     },
//     ['body']
//   )
// )

export const isAdminValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decode_authorization = decode_authorization
              if (decode_authorization.role !== UserRole.Admin) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_NOT_AUTHORIZED,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const isStaffValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              const user_id = decode_authorization.user_id
              const user = await databaseService.users.findOne({
                _id: new ObjectId(user_id)
              })

              if (!user) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              if (!user.is_active) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_IS_DISABLED,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              if (user.role !== UserRole.Staff) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_NOT_AUTHORIZED,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              ;(req as Request).decode_authorization = decode_authorization
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const isStaffOrAdminValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              const user_id = decode_authorization.user_id
              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

              if (!user) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              if (!user.is_active) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_IS_DISABLED,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              if (user.role !== UserRole.Staff && user.role !== UserRole.Admin) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USER_NOT_AUTHORIZED,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              ;(req as Request).decode_authorization = decode_authorization
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)
