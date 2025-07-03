import { ObjectId } from 'mongodb'

interface BlogType {
  _id?: ObjectId
  title: string
  content: string
  image: string
  created_at?: Date
  updated_at?: Date
  author: string
  updated_by?: ObjectId
}

export default class Blog {
  _id?: ObjectId
  title: string
  content: string
  image: string
  created_at?: Date
  updated_at?: Date
  author: string
  updated_by?: ObjectId
  constructor(blog: BlogType) {
    const date = new Date()
    this._id = blog._id
    this.title = blog.title
    this.content = blog.content
    this.image = blog.image
    this.created_at = blog.created_at || date
    this.updated_at = blog.updated_at || date
    this.author = blog.author
    this.updated_by = blog.updated_by
  }
}
