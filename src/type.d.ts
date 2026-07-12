import { Request } from 'express'
import User from './models/schemas/User.schemas'
import { TokenPayload } from './models/requests/User.requests'

declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
  }
  interface Response {
    // Định nghĩa hàm sendSuccess để tự động gợi ý message và data dạng Generic <T>
    sendSuccess?<T = unknown>(message: string, data?: T): this
  }
}
