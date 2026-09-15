import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['login']);
    auth.login.and.returnValue(of({ ok: true }));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('renders the login form', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="login-page"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="login-email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="login-submit"]')).toBeTruthy();
  });

  it('submits credentials through AuthService', () => {
    const component = fixture.componentInstance;
    component.email = 'demo@example.com';
    component.password = 'secret1';
    component.submit();
    expect(auth.login).toHaveBeenCalledWith('demo@example.com', 'secret1');
  });

  it('shows an error message when login fails', () => {
    auth.login.and.returnValue(of({ ok: false, message: 'Email or password is incorrect.' }));

    const component = fixture.componentInstance;
    component.email = 'demo@example.com';
    component.password = 'bad';
    component.submit();
    fixture.detectChanges();

    expect(component.error()).toBe('Email or password is incorrect.');
    expect(fixture.nativeElement.querySelector('[data-testid="login-error"]')?.textContent).toContain(
      'incorrect',
    );
    expect(component.submitting()).toBeFalse();
  });

  it('clears a previous error before submitting again', () => {
    const component = fixture.componentInstance;
    component.error.set('stale');
    component.submit();
    expect(component.error()).toBeNull();
  });
});
