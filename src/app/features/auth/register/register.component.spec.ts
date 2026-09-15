import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['register']);
    auth.register.and.returnValue(of({ ok: true }));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  it('renders the register form', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="register-page"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="register-password"]')).toBeTruthy();
  });

  it('submits registration through AuthService', () => {
    const component = fixture.componentInstance;
    component.email = 'new@example.com';
    component.password = 'secret1';
    component.submit();
    expect(auth.register).toHaveBeenCalledWith('new@example.com', 'secret1');
  });

  it('shows an error message when registration fails', () => {
    auth.register.and.returnValue(
      of({ ok: false, message: 'That email is already registered. Try logging in.' }),
    );

    const component = fixture.componentInstance;
    component.email = 'taken@example.com';
    component.password = 'secret1';
    component.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="register-error"]')?.textContent).toContain(
      'already registered',
    );
    expect(component.submitting()).toBeFalse();
  });
});
