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
  const question = await questionService.createQuestion({ user_id, payload: body })
  res.json({
    message: QUESTION_MESSAGES.CREATE_QUESTION_SUCCESS,
    result: question
  })
}

export const getAllQuestionsController = async (req: Request<any, any, any>, res: Response) => {
  const question = await questionService.getAllQuestion()
  res.json({
    message: QUESTION_MESSAGES.GET_ALL_QUESTION_SUCCESS,
    result: question
  })
}

export const deleteBlogByIdController = async (req: Request<DeleteQuestionIdReqParams, any, any>, res: Response) => {
  const { id } = req.params
  const question = await questionService.deleteQuestion(id)
  res.json(question)
}
