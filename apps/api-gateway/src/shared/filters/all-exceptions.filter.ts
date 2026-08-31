import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_CODES } from '@shiftly/shared-constants';

interface ErrorResponse {
  success: false;
  error: { code: string; message: string; statusCode: number };
  meta: { timestamp: string; requestId: string };
}

/**
 * Emits the same `{ success, error, meta }` envelope the microservices use, so
 * the browser never has to branch on whether an error came from the gateway or
 * from a downstream service.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) ?? uuidv4();
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred. Please try again.';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      code = this.codeForStatus(statusCode);
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const resp = body as Record<string, unknown>;
        const raw = resp.message;
        message = Array.isArray(raw) ? raw.join('; ') : ((raw as string) ?? message);
      }
    } else if (exception instanceof Error) {
      // Never leak internals to callers in production; the stack goes to logs.
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
    }

    if (statusCode >= 500) {
      this.logger.error(
        `[${statusCode}] ${request.method} ${request.url} — ${message} (requestId=${requestId})`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${statusCode}] ${request.method} ${request.url} — ${message} (requestId=${requestId})`,
      );
    }

    const payload: ErrorResponse = {
      success: false,
      error: { code, message, statusCode },
      meta: { timestamp: new Date().toISOString(), requestId },
    };

    response.status(statusCode).set('X-Request-ID', requestId).json(payload);
  }

  private codeForStatus(status: number): string {
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
      case 503:
        return ERROR_CODES.SERVICE_UNAVAILABLE;
      default:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}
