import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/theme/theme.service';

describe('AppComponent', () => {
  let logout: jasmine.Spy;
  let theme: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    logout = jasmine.createSpy('logout').and.returnValue(of(true));
    theme = jasmine.createSpyObj('ThemeService', ['toggle'], {
      mode: () => 'dark',
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user$: of({ email: 'qa@example.com' }),
            logout,
          },
        },
        { provide: ThemeService, useValue: theme },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the Nimbus header, session email, and theme toggle', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('Nimbus');
    expect(compiled.querySelector('[data-testid="user-email"]')?.textContent).toContain('qa@example.com');
    expect(compiled.querySelector('[data-testid="theme-toggle"]')?.textContent?.trim()).toBe('Light');
  });

  it('logs out when the logout button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-testid="logout-button"]').click();

    expect(logout).toHaveBeenCalled();
  });

  it('toggles theme when the button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="theme-toggle"]').click();
    expect(theme.toggle).toHaveBeenCalled();
  });

  it('hides the session controls when there is no user', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user$: of(null),
            logout: () => of(true),
          },
        },
        {
          provide: ThemeService,
          useValue: jasmine.createSpyObj('ThemeService', ['toggle'], { mode: () => 'dark' }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="user-session"]')).toBeNull();
  });
});
