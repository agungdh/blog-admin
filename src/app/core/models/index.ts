export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  markdown: string;
  category: Category | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface PostPayload {
  title: string;
  slug: string;
  markdown: string;
  date: string;
  category_id: number;
  tag_ids: number[];
}

export interface CategoryPayload {
  name: string;
  slug: string;
}

export interface TagPayload {
  name: string;
  slug: string;
}

export interface CursorPage<T> {
  data: T[];
  has_next: boolean;
  next_slug: string;
}

export interface User {
  id: number;
  username: string;
  nama: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  nama: string;
}

export interface ApiError {
  error: string;
}

export interface ValidationErrors {
  errors: Record<string, string[]>;
}

export interface LogoutResponse {
  message: string;
}
