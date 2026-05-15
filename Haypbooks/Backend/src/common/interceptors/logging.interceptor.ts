import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request
    const requestId = request.headers['x-request-id'] || '—'
    const now = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse()
          const statusCode = response.statusCode
          const duration = Date.now() - now
          const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log'
          this.logger[level](`${method} ${url} ${statusCode} ${duration}ms [${requestId}]`)
        },
        error: (error) => {
          const duration = Date.now() - now
          this.logger.error(
            `${method} ${url} ${error.status || 500} ${duration}ms [${requestId}] — ${error.message}`,
          )
        },
      }),
    )
  }
}
