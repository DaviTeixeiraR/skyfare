import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);
Chart.defaults.font.family = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
Chart.defaults.color = '#64748b';

/** Envolve o Chart.js: recria o gráfico sempre que a configuração muda. */
@Component({
  selector: 'app-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  template: `<canvas #canvas [attr.aria-label]="label()" role="img"></canvas>`,
})
export class ChartView {
  readonly config = input.required<ChartConfiguration>();
  readonly label = input('Gráfico');

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    afterRenderEffect(() => {
      const config = this.config();
      this.chart?.destroy();
      this.chart = new Chart(this.canvas().nativeElement, config);
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
