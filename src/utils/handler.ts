import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Cách này sài cho func async
    // Promise.resolve(func(req, res, next)).catch(next)

    //Cách này sài cho func async và func bình thường
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
