import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly isLoggedIn = signal(!!localStorage.getItem('token'));
  readonly userName = signal(localStorage.getItem('nama') ?? '');

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/admin/login`, req);
  }

  me() {
    return this.http.get<User>(`${environment.apiBaseUrl}/api/admin/me`);
  }

  logout() {
    this.http.delete(`${environment.apiBaseUrl}/api/admin/logout`).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  setSession(token: string, nama: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('nama', nama);
    this.isLoggedIn.set(true);
    this.userName.set(nama);
    this.router.navigate(['/admin/posts']);
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    this.isLoggedIn.set(false);
    this.userName.set('');
    this.router.navigate(['/login']);
  }
}
