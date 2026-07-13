import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { QUESTION_MESSAGES } from '~/constants/messages'
import { CreateQuestionReqBody, DeleteQuestionIdReqParams } from '~/models/requests/Question.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import { questionService } from '~/services/question.services'

export const createQuestionController = async (
  req: Request<ParamsDictionary, any, CreateQuestionReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req

  const result = await questionService.createQuestion({ user_id, payload: body })
  res.sendSuccess?.(QUESTION_MESSAGES.CREATE_QUESTION_SUCCESS, { result })
}

export const getAllQuestionsController = async (req: Request<any, any, any>, res: Response) => {
  const result = await questionService.getAllQuestion()
  res.sendSuccess?.(QUESTION_MESSAGES.GET_ALL_QUESTION_SUCCESS, { result })
}

export const deleteBlogByIdController = async (req: Request<DeleteQuestionIdReqParams, any, any>, res: Response) => {
  const { id } = req.params

  const result = await questionService.deleteQuestion(id)
  res.sendSuccess?.(result.message)
}
