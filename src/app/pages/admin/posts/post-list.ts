import { Component, inject, signal, ChangeDetectionStrategy, OnInit, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
    MatDialogModule,
    DatePipe,
  ],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostList implements OnInit {
  private readonly postService = inject(PostService);
  private readonly titleService = inject(TitleService);
  private readonly dialog = inject(MatDialog);
  protected readonly router = inject(Router);

  posts = signal<Post[]>([]);
  loading = signal(false);
  hasNext = signal(false);
  private nextSlug = signal('');

  readonly columns = ['title', 'date', 'category', 'tags', 'actions'];

  constructor() {
    this.titleService.set('Posts');
  }

  ngOnInit(): void {
    this.loadPosts();
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

  categoryLabel(post: Post): string {
    return post.category?.name ?? '-';
  }
}
