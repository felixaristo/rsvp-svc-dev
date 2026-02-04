import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    let message = 'OK';
    if (method === 'POST') message = 'Created';
    else if (method === 'PATCH' || method === 'PUT') message = 'Updated';
    else if (method === 'DELETE') message = 'Deleted';
    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        message,
        data: this.excludeTimestamps(data),
      })),
    );
  }

  private excludeTimestamps(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.excludeTimestamps(item));
    } else if (data !== null && typeof data === 'object') {
      if (data instanceof Date) return data;

      const newData = { ...data };
      delete newData.createdAt;
      delete newData.updatedAt;
      delete newData.deletedAt;
      delete newData.created_at;
      delete newData.updated_at;
      delete newData.deleted_at;

      for (const key in newData) {
        if (Object.prototype.hasOwnProperty.call(newData, key)) {
          newData[key] = this.excludeTimestamps(newData[key]);
        }
      }
      return newData;
    }
    return data;
  }
}
