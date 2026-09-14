import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherChartComponent } from './weather-chart.component';

describe('WeatherChartComponent', () => {
  let fixture: ComponentFixture<WeatherChartComponent>;
  let component: WeatherChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Average temperature');
    component.labels = ['Mon', 'Tue'];
    component.values = [18, 21];
    component.testId = 'temp-chart';
    fixture.detectChanges();
  });

  it('creates a canvas chart for the given dataset', () => {
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(component).toBeTruthy();
    expect(canvas.getAttribute('data-testid')).toBe('temp-chart');
    expect(canvas.getAttribute('aria-label')).toBe('Average temperature');
  });
});
