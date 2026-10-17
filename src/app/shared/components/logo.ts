import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Logotipo: símbolo (sol + avião de papel) e nome "Sky" + "fare". */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-2.5' },
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#3381fc" />
          <stop offset="1" stop-color="#154ede" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" [attr.fill]="'url(#' + gradientId + ')'" />
      <circle cx="31" cy="17" r="7" fill="#fbbf24" />
      <path d="M9 31.5 39 22l-9.5 15-4.5-6.5L9 31.5Z" fill="#fff" />
      <path d="m25 30.5 14-8.5" stroke="#bcdcff" stroke-width="1.6" stroke-linecap="round" />
    </svg>
    @if (showText()) {
      <span
        class="font-extrabold tracking-tight"
        [class]="light() ? 'text-white' : 'text-navy-900'"
        [style.font-size.px]="size() * 0.62"
      >
        Sky<span [class]="light() ? 'text-sun-400' : 'text-sun-500'">fare</span>
      </span>
    }
  `,
})
export class Logo {
  readonly size = input(36);
  readonly showText = input(true);
  readonly light = input(false);

  private static seq = 0;
  protected readonly gradientId = `skyfare-logo-${Logo.seq++}`;
}
