import express from 'express'
import {
  createQuestionController,
  deleteBlogByIdController,
  getAllQuestionsController
} from '~/controllers/question.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { isAdminValidator } from '~/middlewares/user.middlewares'
import { CreateQuestionReqBody } from '~/models/requests/Question.requests'

import { wrapAsync } from '~/utils/handler'

const questionRouter = express.Router()

/**
 * Description. Create a new question
 * Path: /
 * Method: POST
 * Body: { CreateQuestionReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
questionRouter.post(
  '/',
  isAdminValidator,
  filterMiddleware<CreateQuestionReqBody>(['name']),
  wrapAsync(createQuestionController)
)

/**
 * Description. Get all questions
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
questionRouter.get('/', wrapAsync(getAllQuestionsController))

/**
 * Description. Delete a questions by id
 * Path: /:id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token>}
 */
questionRouter.delete('/:id', isAdminValidator, wrapAsync(deleteBlogByIdController))

export default questionRouter
