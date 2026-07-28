import { Component, inject, signal, ChangeDetectionStrategy, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DateAdapter, MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { PostService } from '../../../shared/services/post.service';
import { CategoryService } from '../../../shared/services/category.service';
import { TagService } from '../../../shared/services/tag.service';
import { TitleService } from '../../../shared/services/title.service';
import { Category, Tag, ValidationErrors } from '../../../core/models';

@Component({
  selector: 'app-post-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly postService = inject(PostService);
  private readonly categoryService = inject(CategoryService);
  private readonly tagService = inject(TagService);
  private readonly titleService = inject(TitleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isEdit = signal(false);
  loading = signal(false);
  submitting = signal(false);
  errors = signal<Record<string, string[]>>({});

  categories = signal<Category[]>([]);
  tags = signal<Tag[]>([]);

  private allCategories: Category[] = [];
  private allTags: Tag[] = [];

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    markdown: ['', [Validators.required]],
    date: [new Date(), [Validators.required]],
    category_id: [0],
    tag_ids: [[] as number[]],
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadTags();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadPost(Number(id));
    } else {
      this.titleService.set('New Post');
    }
  }

  private loadCategories() {
    this.categoryService.list().subscribe({
      next: (page) => {
        this.categories.set(page.data);
        this.allCategories = page.data;
      },
    });
  }

  private loadTags() {
    this.tagService.list().subscribe({
      next: (page) => {
        this.tags.set(page.data);
        this.allTags = page.data;
      },
    });
  }

  private loadPost(id: number) {
    this.loading.set(true);
    this.postService.get(id).subscribe({
      next: (post) => {
        this.titleService.set(`Edit: ${post.title}`);
        this.form.patchValue({
          title: post.title,
          slug: post.slug,
          markdown: post.markdown,
          date: new Date(post.date),
          category_id: post.category?.id ?? 0,
          tag_ids: post.tags.map((t) => t.id),
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Post not found', 'Close', { duration: 5000 });
        this.router.navigate(['/admin/posts']);
      },
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.errors.set({});

    const payload = this.getPayload();

    const req = this.isEdit()
      ? this.postService.update(Number(this.route.snapshot.paramMap.get('id')), payload)
      : this.postService.create(payload);

    req.subscribe({
      next: (post) => {
        this.submitting.set(false);
        this.snackBar.open('Post saved!', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/posts']);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.error?.errors) {
          this.errors.set(err.error.errors);
        } else {
          this.snackBar.open(err.error?.error ?? 'Save failed', 'Close', { duration: 5000 });
        }
      },
    });
  }

  private getPayload() {
    const v = this.form.value;
    const date = v.date instanceof Date ? v.date.toISOString().slice(0, 10) : v.date;
    return {
      title: v.title,
      slug: v.slug,
      markdown: v.markdown,
      date,
      category_id: v.category_id || 0,
      tag_ids: v.tag_ids || [],
    };
  }

  fieldError(field: string): string {
    return this.errors()[field]?.join(', ') ?? '';
  }

  generateSlug() {
    const title = this.form.get('title')?.value;
    if (!title) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    this.form.get('slug')?.setValue(slug);
  }
}
