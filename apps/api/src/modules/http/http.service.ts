import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { defer, Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class CustomHttpService {
  private readonly logger = new Logger(CustomHttpService.name);

  constructor(private readonly httpService: HttpService) {}

  private withBackoff<T>(
    sourceFactory: () => Observable<AxiosResponse<T>>,
    retries: number,
  ): Observable<AxiosResponse<T>> {
    return defer(sourceFactory).pipe(
      retry({
        count: retries,
        delay: (error: { message: string }, retryCount) => {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          this.logger.debug(
            `Retry attempt ${retryCount}/${retries} in ${backoffTime}ms — Error: ${error?.message}`,
          );
          return timer(backoffTime);
        },
      }),
      catchError((err: { message: string }) => {
        this.logger.error(
          `Final failure after ${retries} retries: ${err?.message}`,
        );
        return throwError(() => new Error('Request failed after all retries'));
      }),
    );
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig, retries = 3) {
    return this.withBackoff<T>(
      () => this.httpService.get<T>(url, config),
      retries,
    );
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retries = 3,
  ) {
    return this.withBackoff<T>(
      () => this.httpService.post<T>(url, data, config),
      retries,
    );
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retries = 3,
  ) {
    return this.withBackoff<T>(
      () => this.httpService.put<T>(url, data, config),
      retries,
    );
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retries = 3,
  ) {
    return this.withBackoff<T>(
      () => this.httpService.patch<T>(url, data, config),
      retries,
    );
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig, retries = 3) {
    return this.withBackoff<T>(
      () => this.httpService.delete<T>(url, config),
      retries,
    );
  }
}
