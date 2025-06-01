import { checkSchema } from 'express-validator'
import { BLOG_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const createBlogValidator = validate(
  checkSchema(
    {
      title: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.TITLE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.TITLE_MUST_BE_A_STRING
        }
      },
      content: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.CONTENT_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.CONTENT_MUST_BE_A_STRING
        }
      },
      image: {
        isURL: {
          errorMessage: BLOG_MESSAGES.IMAGE_MUST_BE_A_URL
        },
        notEmpty: {
          errorMessage: BLOG_MESSAGES.IMAGE_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.IMAGE_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)

export const updateBlogValidator = validate(
  checkSchema(
    {
      title: {
        notEmpty: undefined,
        isString: {
          errorMessage: BLOG_MESSAGES.TITLE_MUST_BE_A_STRING
        },
        optional: true
      },
      content: {
        notEmpty: undefined,
        isString: {
          errorMessage: BLOG_MESSAGES.CONTENT_MUST_BE_A_STRING
        },
        optional: true
      },
      image: {
        notEmpty: undefined,
        isURL: {
          errorMessage: BLOG_MESSAGES.IMAGE_MUST_BE_A_URL
        },
        isString: {
          errorMessage: BLOG_MESSAGES.IMAGE_MUST_BE_A_STRING
        },
        optional: true
      }
    },
    ['body']
  )
)
