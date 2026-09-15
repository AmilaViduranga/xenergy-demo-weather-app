import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  email = '';
  password = '';
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    this.error.set(null);
    this.submitting.set(true);

    this.auth.login(this.email, this.password).subscribe((result) => {
      this.submitting.set(false);
      if (!result.ok) {
        this.error.set(result.message);
      }
    });
  }
}
