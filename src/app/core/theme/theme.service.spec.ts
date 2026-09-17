import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem('nimbus-theme');
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  it('defaults to dark when nothing is stored and preference is not light', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const service = TestBed.inject(ThemeService);
    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles between light and dark and persists the choice', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const service = TestBed.inject(ThemeService);

    service.toggle();
    expect(service.mode()).toBe('light');
    expect(localStorage.getItem('nimbus-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    service.toggle();
    expect(service.mode()).toBe('dark');
    expect(localStorage.getItem('nimbus-theme')).toBe('dark');
  });

  it('restores a stored light theme', () => {
    localStorage.setItem('nimbus-theme', 'light');
    const service = TestBed.inject(ThemeService);
    expect(service.mode()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
