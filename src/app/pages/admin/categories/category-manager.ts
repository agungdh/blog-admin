import { Component, inject, signal, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../../shared/services/category.service';
import { TitleService } from '../../../shared/services/title.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-manager',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './category-manager.html',
  styleUrl: './category-manager.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryManager implements OnInit, OnDestroy {
  private readonly categoryService = inject(CategoryService);
  private readonly titleService = inject(TitleService);
  private readonly snackBar = inject(MatSnackBar);

  categories = signal<Category[]>([]);
  loading = signal(false);
  hasNext = signal(false);
  private nextSlug = signal('');

  readonly columns = ['name', 'slug', 'actions'];

  private observer?: IntersectionObserver;

  @ViewChild('sentinel', { static: true }) sentinel!: ElementRef;

  constructor() {
    this.titleService.set('Categories');
  }

  ngOnInit(): void {
    this.loadCategories();
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

  loadCategories() {
    this.loading.set(true);
    this.categoryService.list().subscribe({
      next: (page) => {
        this.categories.set(page.data);
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
    this.categoryService.list(this.nextSlug()).subscribe({
      next: (page) => {
        this.categories.update((c) => [...c, ...page.data]);
        this.hasNext.set(page.has_next);
        if (page.has_next) this.nextSlug.set(page.next_slug);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    this.categoryService.delete(id).subscribe(() => {
      this.categories.update((c) => c.filter((x) => x.id !== id));
      this.snackBar.open('Category deleted!', 'Close', { duration: 3000 });
    });
  }
}
