import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CursorPage, Category, CategoryPayload } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/admin/categories`;

  list(after?: string) {
    let params = new HttpParams();
    if (after) params = params.set('after', after);
    return this.http.get<CursorPage<Category>>(this.base, { params });
  }

  get(id: number) {
    return this.http.get<Category>(`${this.base}/${id}`);
  }

  create(payload: CategoryPayload) {
    return this.http.post<Category>(this.base, payload);
  }

  update(id: number, payload: CategoryPayload) {
    return this.http.put<Category>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
