import { Component, inject, signal, ChangeDetectionStrategy, ViewChild, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { TitleService } from '../../shared/services/title.service';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  protected readonly authService = inject(AuthService);
  protected readonly titleService = inject(TitleService);
  private readonly breakpoint = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpoint.observe('(max-width: 768px)').pipe(map((v) => v.matches)),
    { initialValue: false }
  );

  @ViewChild('sidenav') sidenav!: MatSidenav;

  protected readonly navItems = [
    { path: '/admin/posts', label: 'Posts', icon: 'article' },
    { path: '/admin/categories', label: 'Categories', icon: 'category' },
    { path: '/admin/tags', label: 'Tags', icon: 'label' },
  ];

  constructor() {
    effect(() => {
      if (this.isMobile()) {
        this.sidenav?.close();
      }
    });
  }

  closeSidenav() {
    if (this.isMobile() && this.sidenav) {
      this.sidenav.close();
    }
  }
}
