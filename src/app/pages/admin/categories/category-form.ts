import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../../shared/services/category.service';
import { TitleService } from '../../../shared/services/title.service';

@Component({
  selector: 'app-category-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly titleService = inject(TitleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isEdit = signal(false);
  loading = signal(false);
  submitting = signal(false);
  errors = signal<Record<string, string[]>>({});

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadCategory(Number(id));
    } else {
      this.titleService.set('New Category');
    }
  }

  private loadCategory(id: number) {
    this.loading.set(true);
    this.categoryService.get(id).subscribe({
      next: (cat) => {
        this.titleService.set(`Edit: ${cat.name}`);
        this.form.setValue({ name: cat.name, slug: cat.slug });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Category not found', 'Close', { duration: 5000 });
        this.router.navigate(['/admin/categories']);
      },
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.errors.set({});

    const req = this.isEdit()
      ? this.categoryService.update(Number(this.route.snapshot.paramMap.get('id')), this.form.value)
      : this.categoryService.create(this.form.value);

    req.subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Category saved!', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/categories']);
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

  generateSlug() {
    const name = this.form.get('name')?.value;
    if (!name) return;
    this.form.get('slug')?.setValue(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  }

  fieldError(field: string): string {
    return this.errors()[field]?.join(', ') ?? '';
  }
}
