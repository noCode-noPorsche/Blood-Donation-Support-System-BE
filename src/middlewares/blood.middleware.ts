import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { BloodComponentEnum, BloodGroupEnum } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { BLOOD_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import bloodService from '~/services/blood.services'
import { validate } from '~/utils/validation'

export const createBloodGroupValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_IS_REQUIRED
        },
        isIn: {
          options: [Object.values(BloodGroupEnum)],
          errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_IS_INVALID
        },
        isString: {
          errorMessage: BLOOD_MESSAGES.BLOOD_GROUP_MUST_BE_A_STRING
        },

        custom: {
          options: async (value: BloodGroupEnum) => {
            const isBloodGroupExist = await bloodService.isBloodGroupExist(value)
            if (isBloodGroupExist)
              throw new ErrorWithStatus({
                message: BLOOD_MESSAGES.BLOOD_GROUP_ALREADY_EXIST,
                status: HTTP_STATUS.BAD_REQUEST
              })
          }
        }
      }
    },
    ['body']
  )
)

export const createBloodComponentValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_IS_REQUIRED
        },
        isIn: {
          options: [Object.values(BloodComponentEnum)],
          errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_IS_INVALID
        },
        isString: {
          errorMessage: BLOOD_MESSAGES.BLOOD_COMPONENT_MUST_BE_A_STRING
        },
        custom: {
          options: async (value: BloodComponentEnum) => {
            const isBloodComponentExist = await bloodService.isBloodComponentExist(value)
            if (isBloodComponentExist)
              throw new ErrorWithStatus({
                message: BLOOD_MESSAGES.BLOOD_COMPONENT_ALREADY_EXIST,
                status: HTTP_STATUS.BAD_REQUEST
              })
          }
        }
      }
    },
    ['body']
  )
)
