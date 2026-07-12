import { Request, Response, NextFunction } from 'express'

export const defaultResponseHandler = (req: Request, res: Response, next: NextFunction) => {
  res.sendSuccess = function (message, data) {
    return this.json({
      message,
      ...(data !== undefined && { data }) // Chỉ gộp data vào nếu nó được truyền lên
    })
  }
  next()
}
