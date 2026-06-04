import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorPayload = {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const payload = this.buildPayload(status, request.url, exceptionResponse);

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(payload);
  }

  private buildPayload(
    statusCode: number,
    path: string,
    exceptionResponse: string | object | undefined,
  ): ErrorPayload {
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseBody = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };

      return {
        statusCode,
        timestamp: new Date().toISOString(),
        path,
        message: responseBody.message ?? 'Unexpected server error',
        error: responseBody.error ?? HttpStatus[statusCode] ?? 'Error',
      };
    }

    return {
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      message: exceptionResponse ?? 'Unexpected server error',
      error: HttpStatus[statusCode] ?? 'Error',
    };
  }
}
