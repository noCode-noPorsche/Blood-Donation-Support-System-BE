import { CreateBlogReqBody, UpdateBlogReqBody } from '~/models/requests/Blog.requests'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Error'
import { BLOG_MESSAGES } from '~/constants/messages'
import { config } from 'dotenv'
import { HTTP_STATUS } from '~/constants/httpStatus'
config()

class BlogService {
  async createBlog({ user_id, payload }: { user_id: string; payload: CreateBlogReqBody }) {
    const blog = await databaseService.blogs.insertOne({
      ...payload,
      _id: new ObjectId(),
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: new ObjectId(user_id),
      author: payload.author
    })
    return blog
  }

  async getAllBlogs() {
    const blogs = await databaseService.blogs.find({}).toArray()
    return blogs
  }

  async getBlogById(id: string) {
    const blog = await databaseService.blogs.findOne({ _id: new ObjectId(id) })
    if (!blog) {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.BLOG_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return blog
  }

  async updateBlogById({ id, payload, user_id }: { id: string; payload: UpdateBlogReqBody; user_id: string }) {
    const blog = await databaseService.blogs.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...payload, updated_by: new ObjectId(user_id) }, $currentDate: { updated_at: true } },
      {
        returnDocument: 'after'
      }
    )
    if (!blog) {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.BLOG_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return blog
  }

  async deleteBlogById(id: string) {
    const blog = await databaseService.blogs.findOne({ _id: new ObjectId(id) })
    if (!blog) {
      throw new ErrorWithStatus({
        message: BLOG_MESSAGES.BLOG_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const deleteBlog = await databaseService.blogs.deleteOne({ _id: new ObjectId(id) })
    return deleteBlog
  }
}

const blogService = new BlogService()
export default blogService
