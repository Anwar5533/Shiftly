/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: any;
  let mockResponse: any;

  beforeEach(() => {
    interceptor = new TransformInterceptor();

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: 'test' })),
    };

    jest
      .spyOn(global.Date.prototype, 'toISOString')
      .mockReturnValue('2026-07-20T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should transform response to SuccessResponse format', (done) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'X-Request-ID',
          'test-uuid',
        );
        expect(val).toEqual({
          success: true,
          data: { data: 'test' },
          meta: {
            timestamp: '2026-07-20T00:00:00.000Z',
            requestId: 'test-uuid',
          },
        });
        done();
      },
    });
  });

  it('should use existing x-request-id header if present', (done) => {
    mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue({
      headers: { 'x-request-id': 'existing-uuid' },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'X-Request-ID',
          'existing-uuid',
        );
        expect(val.meta.requestId).toBe('existing-uuid');
        done();
      },
    });
  });
});
