import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'
    let error = 'Internal Server Error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || message
      error = (exceptionResponse as any).error || error
    } else if (exception instanceof Error) {
      if (process.env.NODE_ENV === 'production') {
        message = 'An internal server error occurred'
      } else {
        message = exception.message || message
      }
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    )

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
