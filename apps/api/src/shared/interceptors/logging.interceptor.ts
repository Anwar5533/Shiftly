/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;
    const userId = (request as Request & { user?: { sub: string } }).user?.sub;

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? uuidv4();
    const requestId = (request.headers['x-request-id'] as string) ?? uuidv4();

    // Set headers on response
    response.setHeader('X-Request-Id', requestId);
    response.setHeader('X-Correlation-Id', correlationId);

    const startTime = Date.now();

    const logContext = { method, url, ip, userId, requestId, correlationId };

    this.logger.debug(`→ ${method} ${url}`, JSON.stringify(logContext));

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `← ${method} ${url} [${duration}ms]`,
          JSON.stringify({ ...logContext, duration }),
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `← ${method} ${url} [${duration}ms] ERROR`,
          JSON.stringify({ ...logContext, duration }),
        );
        return throwError(() => error);
      }),
    );
  }
}
