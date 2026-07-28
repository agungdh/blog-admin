import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CursorPage, Post, PostPayload } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/admin/posts`;

  list(after?: string) {
    let params = new HttpParams();
    if (after) params = params.set('after', after);
    return this.http.get<CursorPage<Post>>(this.base, { params });
  }

  get(id: number) {
    return this.http.get<Post>(`${this.base}/${id}`);
  }

  create(payload: PostPayload) {
    return this.http.post<Post>(this.base, payload);
  }

  update(id: number, payload: PostPayload) {
    return this.http.put<Post>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
