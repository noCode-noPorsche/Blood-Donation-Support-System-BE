import express from 'express'
import {
  createBlogController,
  deleteBlogByIdController,
  getAllBlogsController,
  getBlogByIdController,
  updateBlogByIdController
} from '~/controllers/blog.controllers'
import { createBlogValidator, updateBlogValidator } from '~/middlewares/blog.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { isAdminValidator } from '~/middlewares/user.middlewares'
import { CreateBlogReqBody, UpdateBlogReqBody } from '~/models/requests/Blog.requests'
import { wrapAsync } from '~/utils/handler'

const blogRouter = express.Router()

/**
 * Description. Create a new blog
 * Path: /
 * Method: POST
 * Body: { CreateBlogReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
blogRouter.post(
  '/',
  isAdminValidator,
  createBlogValidator,
  filterMiddleware<CreateBlogReqBody>(['author', 'content', 'image', 'title']),
  wrapAsync(createBlogController)
)

/**
 * Description. Get all blogs
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
blogRouter.get('/', wrapAsync(getAllBlogsController))

/**
 * Description. Get a blog by id
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
blogRouter.get('/:id', wrapAsync(getBlogByIdController))

/**
 * Description. Update a blog by id
 * Path: /:id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token>}
 * Body: { UpdateBlogReqBody }
 */
blogRouter.patch(
  '/:id',
  isAdminValidator,
  updateBlogValidator,
  filterMiddleware<UpdateBlogReqBody>(['title', 'content', 'image', 'author']),
  wrapAsync(updateBlogByIdController)
)

/**
 * Description. Delete a blog by id
 * Path: /:id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token>}
 */
blogRouter.delete('/:id', isAdminValidator, wrapAsync(deleteBlogByIdController))

export default blogRouter
