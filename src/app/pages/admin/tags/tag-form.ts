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
import { TagService } from '../../../shared/services/tag.service';
import { TitleService } from '../../../shared/services/title.service';

@Component({
  selector: 'app-tag-form',
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
  templateUrl: './tag-form.html',
  styleUrl: './tag-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tagService = inject(TagService);
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
      this.loadTag(Number(id));
    } else {
      this.titleService.set('New Tag');
    }
  }

  private loadTag(id: number) {
    this.loading.set(true);
    this.tagService.get(id).subscribe({
      next: (tag) => {
        this.titleService.set(`Edit: ${tag.name}`);
        this.form.setValue({ name: tag.name, slug: tag.slug });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Tag not found', 'Close', { duration: 5000 });
        this.router.navigate(['/admin/tags']);
      },
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.errors.set({});

    const req = this.isEdit()
      ? this.tagService.update(Number(this.route.snapshot.paramMap.get('id')), this.form.value)
      : this.tagService.create(this.form.value);

    req.subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Tag saved!', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/tags']);
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
