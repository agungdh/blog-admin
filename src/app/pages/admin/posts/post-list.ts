import { Component, inject, signal, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe } from '@angular/common';
import { PostService } from '../../../shared/services/post.service';
import { TitleService } from '../../../shared/services/title.service';
import { Post } from '../../../core/models';

@Component({
  selector: 'app-post-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    DatePipe,
  ],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostList implements OnInit, OnDestroy {
  private readonly postService = inject(PostService);
  private readonly titleService = inject(TitleService);

  posts = signal<Post[]>([]);
  loading = signal(false);
  hasNext = signal(false);
  private nextSlug = signal('');

  readonly columns = ['title', 'date', 'category', 'tags', 'actions'];

  private observer?: IntersectionObserver;

  @ViewChild('sentinel', { static: true }) sentinel!: ElementRef;

  constructor() {
    this.titleService.set('Posts');
  }

  ngOnInit(): void {
    this.loadPosts();
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

  loadPosts() {
    this.loading.set(true);
    this.postService.list().subscribe({
      next: (page) => {
        this.posts.set(page.data);
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
    this.postService.list(this.nextSlug()).subscribe({
      next: (page) => {
        this.posts.update((p) => [...p, ...page.data]);
        this.hasNext.set(page.has_next);
        if (page.has_next) this.nextSlug.set(page.next_slug);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(post: Post) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    this.postService.delete(post.id).subscribe(() => {
      this.posts.update((p) => p.filter((x) => x.id !== post.id));
    });
  }
}
