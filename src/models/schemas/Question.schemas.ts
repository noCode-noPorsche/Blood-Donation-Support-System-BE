import { ObjectId } from 'mongodb'

interface QuestionType {
  _id: ObjectId
  name: string
  created_at: Date
  updated_at: Date
  updated_by: ObjectId
}

export default class Question {
  _id: ObjectId
  name: string
  created_at: Date
  updated_at: Date
  updated_by: ObjectId
  constructor(question: QuestionType) {
    const date = new Date()
    this._id = question._id
    this.name = question.name
    this.created_at = question.created_at || date
    this.updated_at = question.updated_at || date
    this.updated_by = question.updated_by
  }
}
