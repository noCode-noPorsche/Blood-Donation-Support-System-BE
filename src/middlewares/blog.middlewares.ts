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
      },
      author: {
        notEmpty: {
          errorMessage: BLOG_MESSAGES.AUTHOR_IS_REQUIRED
        },
        isString: {
          errorMessage: BLOG_MESSAGES.AUTHOR_MUST_BE_A_STRING
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
        optional: true,
        // notEmpty: undefined,
        isString: {
          errorMessage: BLOG_MESSAGES.TITLE_MUST_BE_A_STRING
        }
      },
      content: {
        optional: true,
        // notEmpty: undefined,
        isString: {
          errorMessage: BLOG_MESSAGES.CONTENT_MUST_BE_A_STRING
        }
      },
      image: {
        notEmpty: undefined,
        optional: true,
        isURL: {
          errorMessage: BLOG_MESSAGES.IMAGE_MUST_BE_A_URL
        },
        isString: {
          errorMessage: BLOG_MESSAGES.IMAGE_MUST_BE_A_STRING
        }
      },
      author: {
        optional: true,
        // notEmpty: {
        //   errorMessage: BLOG_MESSAGES.AUTHOR_IS_REQUIRED
        // },
        isString: {
          errorMessage: BLOG_MESSAGES.AUTHOR_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)
