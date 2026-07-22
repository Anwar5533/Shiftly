/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_CODES } from '@shiftly/shared-constants';

interface ErrorDetail {
  field?: string;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: ErrorDetail[];
    statusCode: number;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) ?? uuidv4();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred. Please try again.';
    let details: ErrorDetail[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string) ?? message;
        errorCode =
          (resp['error'] as string) ?? this.getErrorCodeFromStatus(statusCode);

        // Handle class-validator ValidationPipe errors
        if (Array.isArray(resp['message'])) {
          message = 'Validation failed';
          errorCode = ERROR_CODES.VALIDATION_ERROR;
          details = (resp['message'] as string[]).map((msg) => {
            const parts = msg.split(' ');
            const field = parts[0];
            return { field, message: msg };
          });
        }
      }
    } else if (exception instanceof Error) {
      // Log unexpected errors fully
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        'GlobalExceptionFilter',
      );

      // In production, don't expose internal error details
      if (process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred. Please try again.';
      } else {
        message = exception.message;
      }
    }

    // Log all 5xx errors
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- TODO(RC3): Address type safety
    if (statusCode >= 500) {
      this.logger.error(
        `[${statusCode}] ${request.method} ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- TODO(RC3): Address type safety
    } else if (statusCode >= 400) {
      this.logger.warn(
        `[${statusCode}] ${request.method} ${request.url} - ${message}`,
        'GlobalExceptionFilter',
      );
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
        statusCode,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    response
      .status(statusCode)
      .set('X-Request-ID', requestId)
      .json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case 400:
        return ERROR_CODES.VALIDATION_ERROR;
      case 401:
        return ERROR_CODES.UNAUTHORIZED;
      case 403:
        return ERROR_CODES.FORBIDDEN;
      case 404:
        return ERROR_CODES.NOT_FOUND;
      case 409:
        return ERROR_CODES.CONFLICT;
      case 429:
        return ERROR_CODES.RATE_LIMIT_EXCEEDED;
      default:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}
