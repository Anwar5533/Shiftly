/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);
  private readonly TTL_SECONDS = 86400; // 24 hours

  constructor(private readonly redis: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const method = request.method;
    // Only apply idempotency to mutations
    if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'] as string;
    if (!idempotencyKey) {
      return next.handle();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    const userId = (request as any).user?.sub;
    if (!userId) {
      // If unauthenticated but has idempotency key, we could bypass or hash IP. Bypass for now.
      return next.handle();
    }

    const cacheKey = `idempotency:${userId}:${idempotencyKey}`;
    const cachedRecord = await this.redis.get(cacheKey);

    if (cachedRecord) {
      this.logger.debug(`Idempotency cache hit for key: ${cacheKey}`);
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        const parsed = JSON.parse(cachedRecord);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
        if (parsed.status === 'IN_PROGRESS') {
          throw new ConflictException(
            'Request with this Idempotency-Key is currently being processed.',
          );
        }

        // Restore response status and headers
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
        response.status(parsed.statusCode);
        response.setHeader('X-Idempotency-Cache-Hit', 'true');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
        return of(parsed.body);
      } catch (e) {
        if (e instanceof ConflictException) throw e;
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- TODO(RC3): Address type safety
        this.logger.warn(`Failed to parse idempotency cache record: ${e}`);
      }
    }

    // Mark as in-progress to prevent concurrent execution

    await this.redis.set(
      cacheKey,
      JSON.stringify({ status: 'IN_PROGRESS' }),
      this.TTL_SECONDS,
    );

    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO(RC3): Address type safety
      tap(async (data) => {
        const responseData = {
          status: 'COMPLETED',
          statusCode: response.statusCode,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          body: data,
        };

        await this.redis.set(
          cacheKey,
          JSON.stringify(responseData),
          this.TTL_SECONDS,
        );
      }),
      catchError((error: unknown) => {
        // If the request fails, clear the in-progress flag so they can retry safely

        this.redis
          .del(cacheKey)
          .catch((e) =>
            this.logger.error('Failed to clear idempotency key on error', e),
          );
        return throwError(() => error);
      }),
    );
  }
}
