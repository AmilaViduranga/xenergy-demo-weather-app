import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  title = 'Nimbus Weather Lab';
  readonly user$ = this.auth.user$;
  readonly mode = this.theme.mode;

  logout(): void {
    this.auth.logout().subscribe();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
