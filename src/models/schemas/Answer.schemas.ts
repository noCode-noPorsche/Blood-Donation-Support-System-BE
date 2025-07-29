import { ObjectId } from 'mongodb'

interface AnswerType {
  _id: ObjectId
  user_id: ObjectId
  donation_registration_id: ObjectId
  answers: {
    question_id: ObjectId
    answer: boolean
  }[]
  created_at: Date
}

export default class Answer {
  _id: ObjectId
  user_id: ObjectId
  donation_registration_id: ObjectId
  answers: {
    question_id: ObjectId
    answer: boolean
  }[]
  created_at: Date
  constructor(answer: AnswerType) {
    const date = new Date()
    this._id = answer._id
    this.user_id = answer.user_id
    this.donation_registration_id = answer.donation_registration_id
    this.answers = answer.answers
    this.created_at = answer.created_at || date
  }
}
