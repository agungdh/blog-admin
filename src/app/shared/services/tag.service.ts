import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CursorPage, Tag, TagPayload } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/admin/tags`;

  list(after?: string) {
    let params = new HttpParams();
    if (after) params = params.set('after', after);
    return this.http.get<CursorPage<Tag>>(this.base, { params });
  }

  get(id: number) {
    return this.http.get<Tag>(`${this.base}/${id}`);
  }

  create(payload: TagPayload) {
    return this.http.post<Tag>(this.base, payload);
  }

  update(id: number, payload: TagPayload) {
    return this.http.put<Tag>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
