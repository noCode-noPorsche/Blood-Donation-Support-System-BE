import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { CreateQuestionReqBody } from '~/models/requests/Question.requests'
import Question from '~/models/schemas/Question.schemas'
import { ErrorWithStatus } from '~/models/Error'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { QUESTION_MESSAGES } from '~/constants/messages'

class QuestionService {
  async createQuestion({ user_id, payload }: { user_id: string; payload: CreateQuestionReqBody }) {
    const now = new Date()

    const question = new Question({
      _id: new ObjectId(),
      name: payload.name,
      created_at: now,
      updated_at: now,
      updated_by: new ObjectId(user_id),
      is_delete: false
    })

    await databaseService.questions.insertOne(question)

    return question
  }

  async deleteQuestion(questionId: string) {
    const result = await databaseService.questions.updateOne(
      { _id: new ObjectId(questionId) },
      {
        $set: {
          is_delete: true,
          updated_at: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: QUESTION_MESSAGES.QUESTION_NOT_FOUND
      })
    }

    return { message: QUESTION_MESSAGES.DELETE_QUESTION_SUCCESS }
  }

  async getAllQuestion() {
    const result = await databaseService.questions
      .aggregate([
        {
          $match: {
            is_delete: { $ne: true } // chỉ lấy câu hỏi chưa bị xóa
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by', // field trong questions
            foreignField: '_id', // field trong users
            as: 'creator'
          }
        },
        { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } }, // lấy 1 user
        {
          $project: {
            _id: 1,
            name: 1,
            created_at: 1,
            update_by: '$creator.full_name'
          }
        }
      ])
      .toArray()

    return result
  }
}

export const questionService = new QuestionService()
