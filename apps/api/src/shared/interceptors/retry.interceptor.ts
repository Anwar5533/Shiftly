/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

@Injectable()
export class RetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RetryInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    // Only retry idempotent methods
    const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];

    const isIdempotent = idempotentMethods.includes(req.method.toUpperCase());

    return next.handle().pipe(
      // Timeout after 10 seconds
      timeout(10000),
      // Retry up to 3 times for idempotent requests if there's a TimeoutError or 5xx error
      retry({
        count: isIdempotent ? 2 : 0,
        delay: (error, retryCount) => {
          if (
            error instanceof TimeoutError ||
            (error.status && error.status >= 500)
          ) {
            this.logger.warn(
              `Request failed (Attempt ${retryCount}), retrying...`,
            );
            return new Observable((subscriber) => {
              setTimeout(() => {
                subscriber.next(true);
                subscriber.complete();
              }, 1000 * retryCount); // Exponential-ish backoff
            });
          }

          return throwError(() => error);
        },
      }),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }

        return throwError(() => err);
      }),
    );
  }
}
