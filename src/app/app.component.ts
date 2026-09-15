import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly auth = inject(AuthService);

  title = 'Nimbus Weather Lab';
  readonly user$ = this.auth.user$;

  logout(): void {
    this.auth.logout().subscribe();
  }
}
