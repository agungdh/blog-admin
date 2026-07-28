import { Component, inject, signal, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TagService } from '../../../shared/services/tag.service';
import { TitleService } from '../../../shared/services/title.service';
import { Tag } from '../../../core/models';

@Component({
  selector: 'app-tag-manager',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './tag-manager.html',
  styleUrl: './tag-manager.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagManager implements OnInit, OnDestroy {
  private readonly tagService = inject(TagService);
  private readonly titleService = inject(TitleService);
  private readonly snackBar = inject(MatSnackBar);

  tags = signal<Tag[]>([]);
  loading = signal(false);
  hasNext = signal(false);
  private nextSlug = signal('');

  readonly columns = ['name', 'slug', 'actions'];

  private observer?: IntersectionObserver;

  @ViewChild('sentinel', { static: true }) sentinel!: ElementRef;

  constructor() {
    this.titleService.set('Tags');
  }

  ngOnInit(): void {
    this.loadTags();
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasNext() && !this.loading()) {
          this.loadMore();
        }
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this.sentinel.nativeElement);
  }

  loadTags() {
    this.loading.set(true);
    this.tagService.list().subscribe({
      next: (page) => {
        this.tags.set(page.data);
        this.hasNext.set(page.has_next);
        if (page.has_next) this.nextSlug.set(page.next_slug);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadMore() {
    if (!this.hasNext()) return;
    this.loading.set(true);
    this.tagService.list(this.nextSlug()).subscribe({
      next: (page) => {
        this.tags.update((t) => [...t, ...page.data]);
        this.hasNext.set(page.has_next);
        if (page.has_next) this.nextSlug.set(page.next_slug);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    this.tagService.delete(id).subscribe(() => {
      this.tags.update((t) => t.filter((x) => x.id !== id));
      this.snackBar.open('Tag deleted!', 'Close', { duration: 3000 });
    });
  }
}
