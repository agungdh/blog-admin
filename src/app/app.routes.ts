import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'posts',
        loadComponent: () =>
          import('./pages/admin/posts/post-list').then((m) => m.PostList),
      },
      {
        path: 'posts/new',
        loadComponent: () =>
          import('./pages/admin/posts/post-form').then((m) => m.PostForm),
      },
      {
        path: 'posts/:id',
        loadComponent: () =>
          import('./pages/admin/posts/post-form').then((m) => m.PostForm),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin/categories/category-manager').then((m) => m.CategoryManager),
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('./pages/admin/tags/tag-manager').then((m) => m.TagManager),
      },
      { path: '', redirectTo: 'posts', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/admin/posts', pathMatch: 'full' },
  { path: '**', redirectTo: '/admin/posts' },
];
