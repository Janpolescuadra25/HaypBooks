import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Accept JWT either from Authorization header (Bearer) or from cookie named 'token'
      jwtFromRequest: (req: any) => {
        // Try header first
        const headerFn = ExtractJwt.fromAuthHeaderAsBearerToken()
        let token = headerFn(req)
        // then try cookie (express cookie parser) or raw cookie header
        if (!token && req && req.cookies && req.cookies.token) token = req.cookies.token
        if (!token && req && req.headers && req.headers.cookie) {
          const m = String(req.headers.cookie).split(';').map((c:any)=>c.trim()).find((c:any)=>c.startsWith('token='))
          if (m) token = decodeURIComponent(m.split('=')[1])
        }
        return token
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    })
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
