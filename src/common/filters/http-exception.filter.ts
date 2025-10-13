import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: any;
  errorCode?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    this.logError(exception, request, errorResponse.statusCode);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const baseResponse = {
      success: false as const,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (exception instanceof HttpException) {
      return {
        ...baseResponse,
        ...this.extractHttpExceptionDetails(exception),
      };
    }

    if (exception instanceof ZodError) {
      return {
        ...baseResponse,
        ...this.extractZodErrorDetails(exception),
      };
    }

    if (exception instanceof Error) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        errorCode: 'UNKNOWN_ERROR',
      };
    }

    return {
      ...baseResponse,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private extractHttpExceptionDetails(exception: HttpException) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return { statusCode: status, message: exceptionResponse };
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const response = exceptionResponse as any;
      return {
        statusCode: status,
        message: response.message || exceptionResponse,
        errorCode: response.error,
      };
    }

    return { statusCode: status, message: exceptionResponse };
  }

  private extractZodErrorDetails(exception: ZodError) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: 'VALIDATION_ERROR',
      message: {
        message: 'Validation failed',
        errors: exception.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      },
    };
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const userId = (request as any).user?.id || 'anonymous';
    const errorStack = exception instanceof Error ? exception.stack : String(exception);

    this.logger.error(`HTTP ${status} - ${request.method} ${request.url}`, {
      exception: errorStack,
      body: request.body,
      query: request.query,
      params: request.params,
      user: userId,
    });
  }
}

