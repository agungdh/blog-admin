import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../../shared/services/category.service';
import { TitleService } from '../../../shared/services/title.service';
import { Category, ValidationErrors } from '../../../core/models';

@Component({
  selector: 'app-category-manager',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './category-manager.html',
  styleUrl: './category-manager.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryManager implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly titleService = inject(TitleService);
  private readonly snackBar = inject(MatSnackBar);

  categories = signal<Category[]>([]);
  loading = signal(false);
  hasNext = signal(false);
  private nextSlug = signal('');

  editingId = signal<number | null>(null);
  creating = signal(false);

  addForm: FormGroup;
  editForm: FormGroup;

  addErrors = signal<Record<string, string[]>>({});
  editErrors = signal<Record<string, string[]>>({});

  readonly columns = ['name', 'slug', 'actions'];

  constructor() {
    this.titleService.set('Categories');

    this.addForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
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

  startCreate() {
    this.creating.set(true);
    this.addForm.reset({ name: '', slug: '' });
    this.addErrors.set({});
  }

  cancelCreate() {
    this.creating.set(false);
  }

  saveCreate() {
    if (this.addForm.invalid) return;
    this.categoryService.create(this.addForm.value).subscribe({
      next: (cat) => {
        this.categories.update((c) => [cat, ...c]);
        this.creating.set(false);
        this.snackBar.open('Category created!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        if (err.error?.errors) this.addErrors.set(err.error.errors);
        else this.snackBar.open(err.error?.error ?? 'Failed', 'Close', { duration: 5000 });
      },
    });
  }

  startEdit(cat: Category) {
    this.editingId.set(cat.id);
    this.editForm.setValue({ name: cat.name, slug: cat.slug });
    this.editErrors.set({});
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(id: number) {
    if (this.editForm.invalid) return;
    this.categoryService.update(id, this.editForm.value).subscribe({
      next: (updated) => {
        this.categories.update((c) => c.map((x) => (x.id === id ? updated : x)));
        this.editingId.set(null);
        this.snackBar.open('Category updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        if (err.error?.errors) this.editErrors.set(err.error.errors);
        else this.snackBar.open(err.error?.error ?? 'Failed', 'Close', { duration: 5000 });
      },
    });
  }

  delete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    this.categoryService.delete(id).subscribe(() => {
      this.categories.update((c) => c.filter((x) => x.id !== id));
      this.snackBar.open('Category deleted!', 'Close', { duration: 3000 });
    });
  }

  fieldError(field: string, source: 'add' | 'edit'): string {
    const errors = source === 'add' ? this.addErrors() : this.editErrors();
    return errors[field]?.join(', ') ?? '';
  }

  generateSlug(target: 'add' | 'edit') {
    const form = target === 'add' ? this.addForm : this.editForm;
    const name = form.get('name')?.value;
    if (!name) return;
    form.get('slug')?.patchValue(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  }
}
