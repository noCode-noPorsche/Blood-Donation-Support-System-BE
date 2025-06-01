import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateBlogReqBody {
  title: string
  content: string
  image: string
}

export interface GetBlogByIdReqParams {
  id: string
}

export interface UpdateBlogReqBody {
  title?: string
  content?: string
  image?: string
}

export interface DeleteBlogByIdReqParams extends ParamsDictionary {
  id: string
}

export interface UpdateBlogByIdReqParams extends ParamsDictionary {
  id: string
}
