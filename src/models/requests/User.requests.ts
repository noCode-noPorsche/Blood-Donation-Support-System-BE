import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserGender, UserRole } from '~/constants/enum'

export interface RegisterReqBody {
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
  weight: number
  role: UserRole
  full_name: string
  gender: UserGender
  phone: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  role: UserRole
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}
