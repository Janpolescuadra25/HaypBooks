import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const statusCode = context.switchToHttp().getResponse().statusCode

    return next.handle().pipe(
      map(data => {
        if (request.url === '/health') return data
        if (data && typeof data === 'object' && data.success !== undefined) return data

        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
          requestId: request.headers['x-request-id'] || null,
        }
      }),
    )
  }
}
