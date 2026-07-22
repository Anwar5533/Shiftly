/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { GlobalExceptionFilter } from './global-exception.filter';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ERROR_CODES } from '@shiftly/shared-constants';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;
    filter = new GlobalExceptionFilter(mockLogger);
  });

  describe('catch', () => {
    let mockArgumentsHost: ArgumentsHost;
    let mockResponse: any;
    let mockRequest: any;

    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockRequest = {
        method: 'GET',
        url: '/test',
        headers: {},
      };
      mockArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
          getResponse: () => mockResponse,
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
          getRequest: () => mockRequest,
        }),
      } as unknown as ArgumentsHost;

      process.env.NODE_ENV = 'development';
    });

    it('should handle standard HttpException with string response', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      filter.catch(exception, mockArgumentsHost);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          error: expect.objectContaining({
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Forbidden',
            code: ERROR_CODES.INTERNAL_SERVER_ERROR, // Default from initialization since it's a string response
          }),
        }),
      );
// eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle standard HttpException with object response', () => {
      const exception = new HttpException(
        {
          message: 'Invalid input',
          error: 'BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          error: expect.objectContaining({
            message: 'Invalid input',
            code: 'BAD_REQUEST',
          }),
        }),
      );
// eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle class-validator array of messages', () => {
      const exception = new HttpException(
        {
          message: ['email must be a valid email', 'password is too short'],
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          error: expect.objectContaining({
            message: 'Validation failed',
            code: ERROR_CODES.VALIDATION_ERROR,
            details: [
              { field: 'email', message: 'email must be a valid email' },
              { field: 'password', message: 'password is too short' },
            ],
          }),
        }),
      );
    });

    it('should handle unknown Error and log it as 500', () => {
      const error = new Error('Database connection failed');
      filter.catch(error, mockArgumentsHost);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          error: expect.objectContaining({
            message: 'Database connection failed',
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          }),
        }),
      );
// eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
      expect(mockLogger.error).toHaveBeenCalledTimes(2); // One for Unhandled exception, one for 500 error
    });

    it('should hide error details in production for 500', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Secret database credentials');

      filter.catch(error, mockArgumentsHost);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          error: expect.objectContaining({
            message: 'An unexpected error occurred. Please try again.',
          }),
        }),
      );
    });
  });
});
