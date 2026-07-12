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

  const result = await blogServices.createBlog({ user_id, payload: body })
  res.sendSuccess?.(BLOG_MESSAGES.CREATE_BLOG_SUCCESS, { result })
}

export const getAllBlogsController = async (_req: Request, res: Response) => {
  const result = await blogServices.getAllBlogs()
  res.sendSuccess?.(BLOG_MESSAGES.GET_ALL_BLOGS_SUCCESS, { result })
}

export const getBlogByIdController = async (req: Request<GetBlogByIdReqParams>, res: Response) => {
  const { id } = req.params

  const result = await blogServices.getBlogById(id)
  res.sendSuccess?.(BLOG_MESSAGES.GET_BLOG_SUCCESS, { result })
}

export const updateBlogByIdController = async (
  req: Request<UpdateBlogByIdReqParams, any, UpdateBlogReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { id } = req.params
  const { body } = req

  const result = await blogServices.updateBlogById({ id, payload: body, user_id })
  res.sendSuccess?.(BLOG_MESSAGES.UPDATE_BLOG_SUCCESS, { result })
}

export const deleteBlogByIdController = async (req: Request<DeleteBlogByIdReqParams>, res: Response) => {
  const { id } = req.params

  const result = await blogServices.deleteBlogById(id)
  res.sendSuccess?.(result.message)
}
