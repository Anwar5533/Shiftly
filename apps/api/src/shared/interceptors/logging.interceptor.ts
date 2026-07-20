import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userId = (request as Request & { user?: { sub: string } }).user?.sub;
    const requestId = (request.headers['x-request-id'] as string) ?? uuidv4();
    const startTime = Date.now();

    const logContext = { method, url, ip, userId, requestId };

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
