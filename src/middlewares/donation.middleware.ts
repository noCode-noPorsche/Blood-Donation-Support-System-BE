import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ErrorWithStatus } from '~/models/Error'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'

const objectIdField = (fieldName: string): ParamSchema => ({
  notEmpty: {
    errorMessage: `${fieldName} is required`
  },
  custom: {
    options: (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: `${fieldName} is not a valid ObjectId`,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      return true
    }
  }
})

export const createDonationValidator = validate(
  checkSchema(
    {
      user_id: objectIdField('user_id'),
      blood_group_id: objectIdField('blood_group_id'),
      blood_component_id: objectIdField('blood_component_id')
    },
    ['body']
  )
)
export const updateDonationStatusValidator = validate(
  checkSchema(
    {
      status: {
        notEmpty: {
          errorMessage: 'Status is required'
        },
        isString: {
          errorMessage: 'Status must be a string'
        },
        isIn: {
          options: [['pending', 'completed', 'cancelled']], // Hoặc enum nếu có
          errorMessage: 'Invalid status value'
        }
      }
    },
    ['body']
  )
)

// ✅ Validate update donation process
export const updateDonationRequestProcessValidator = validate(
  checkSchema(
    {
      status: {
        optional: true,
        isString: {
          errorMessage: 'Status must be a string'
        },
        isIn: {
          options: [['pending', 'completed', 'cancelled']],
          errorMessage: 'Invalid status'
        }
      },
      volumeCollected: {
        optional: true,
        isFloat: {
          options: { min: 0 },
          errorMessage: 'volumeCollected must be a positive number'
        }
      },
      donationDate: {
        optional: true,
        isISO8601: {
          options: { strict: true },
          errorMessage: 'donationDate must be a valid ISO date'
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: 'description must be a string'
        },
        isLength: {
          options: { max: 500 },
          errorMessage: 'description must be less than 500 characters'
        }
      }
    },
    ['body']
  )
)
