import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

@Component({
  selector: 'app-weather-chart',
  standalone: true,
  template: `
    <canvas
      #canvas
      [attr.aria-label]="title"
      [attr.data-testid]="testId"
      role="img"
    ></canvas>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 260px;
      }

      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class WeatherChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas?: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) title = '';
  @Input() type: 'line' | 'bar' = 'line';
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() color = '#7dd3fc';
  @Input() yLabel = '';
  @Input() testId = 'weather-chart';

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['labels'] || changes['values'] || changes['type'] || changes['color'])) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    const canvas = this.canvas?.nativeElement;
    if (!canvas) {
      return;
    }

    this.chart?.destroy();

    const dataset = {
      label: this.title,
      data: this.values,
      borderColor: this.color,
      backgroundColor: this.type === 'bar' ? this.color : `${this.color}33`,
      fill: this.type === 'line',
      tension: 0.35,
      borderWidth: 2,
      pointRadius: this.type === 'line' ? 3 : 0,
      borderRadius: 8,
    };

    this.chart = new Chart(canvas, {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: [dataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0b1220',
            titleColor: '#e2e8f0',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true },
            grid: { color: 'rgba(148, 163, 184, 0.12)' },
          },
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.12)' },
            title: {
              display: Boolean(this.yLabel),
              text: this.yLabel,
              color: '#cbd5e1',
            },
          },
        },
      },
    });
  }
}
