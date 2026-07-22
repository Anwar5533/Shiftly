import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: jest.Mocked<Logger>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: any;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    mockLogger = {
      debug: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    } as any;

    interceptor = new LoggingInterceptor(mockLogger);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/test',
          ip: '127.0.0.1',
          headers: {},
          user: { sub: 'user-123' },
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
          setHeader: jest.fn(),
        }),
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test-response')),
    };

    // Mock Date.now for predictable duration
    jest.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log incoming request and successful response', (done) => {
    let nowCount = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      nowCount++;
      return nowCount === 1 ? 1000 : 1050; // 50ms duration
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toBe('test-response');
        // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
        expect(mockLogger.debug).toHaveBeenCalledWith(
          '→ GET /test',
          expect.stringContaining(
            '"userId":"user-123","requestId":"test-uuid"',
          ),
        );
        // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
        expect(mockLogger.log).toHaveBeenCalledWith(
          '← GET /test [50ms]',
          expect.stringContaining('"duration":50'),
        );
        done();
      },
    });
  });

  it('should log incoming request and error response', (done) => {
    const error = new Error('test-error');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    mockCallHandler.handle.mockReturnValue(throwError(() => error));

    let nowCount = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      nowCount++;
      return nowCount === 1 ? 1000 : 1020; // 20ms duration
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
        expect(mockLogger.debug).toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
        expect(mockLogger.error).toHaveBeenCalledWith(
          '← GET /test [20ms] ERROR',
          expect.stringContaining('"duration":20'),
        );
        done();
      },
    });
  });
});
