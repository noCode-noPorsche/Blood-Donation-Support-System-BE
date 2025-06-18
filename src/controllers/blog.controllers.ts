import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BLOG_MESSAGES } from '~/constants/messages'
import {
  CreateBlogReqBody,
  DeleteBlogByIdReqParams,
  GetBlogByIdReqParams,
  UpdateBlogByIdReqParams,
  UpdateBlogReqBody
} from '~/models/requests/Blog.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import blogServices from '~/services/blog.services'

export const createBlogController = async (req: Request<ParamsDictionary, any, CreateBlogReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const blog = await blogServices.createBlog({ user_id, payload: body })
  res.status(201).json({
    message: BLOG_MESSAGES.CREATE_BLOG_SUCCESS,
    result: blog
  })
}

export const getAllBlogsController = async (req: Request, res: Response) => {
  const blogs = await blogServices.getAllBlogs()
  res.json({
    message: BLOG_MESSAGES.GET_ALL_BLOGS_SUCCESS,
    result: blogs
  })
}

export const getBlogByIdController = async (req: Request<GetBlogByIdReqParams>, res: Response) => {
  const { id } = req.params
  const blog = await blogServices.getBlogById(id)
  res.json({
    message: BLOG_MESSAGES.GET_BLOG_SUCCESS,
    result: blog
  })
}

export const updateBlogByIdController = async (
  req: Request<UpdateBlogByIdReqParams, any, UpdateBlogReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req
  const blog = await blogServices.updateBlogById({ id, payload: body, user_id })
  res.json({
    message: BLOG_MESSAGES.UPDATE_BLOG_SUCCESS,
    result: blog
  })
}

export const deleteBlogByIdController = async (req: Request<DeleteBlogByIdReqParams>, res: Response) => {
  const { id } = req.params
  await blogServices.deleteBlogById(id)
  res.json({
    message: BLOG_MESSAGES.DELETE_BLOG_SUCCESS
  })
}
