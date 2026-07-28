import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private readonly title = inject(Title);

  readonly current = signal('');

  set(value: string) {
    this.current.set(value);
    this.title.setTitle(value ? `${value} - Blog Admin` : 'Blog Admin');
  }
}
