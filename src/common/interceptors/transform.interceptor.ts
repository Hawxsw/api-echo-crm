import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface WrappedResponse<T> {
  readonly data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>> {
    return next.handle().pipe(
      map((data): WrappedResponse<T> => {
        if (this.isAlreadyWrapped(data)) {
          return data as WrappedResponse<T>;
        }
        return { data };
      }),
    );
  }

  private isAlreadyWrapped(data: unknown): boolean {
    return typeof data === 'object' && data !== null && 'data' in data;
  }
}

