import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Bandeira do país (mesma imagem que a REST Countries devolve em flags.png). */
@Component({
  selector: 'app-flag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `
    <img
      [src]="src()"
      [alt]="'Bandeira ' + code()"
      [style.width.px]="size()"
      [style.height.px]="size() * 0.7"
      class="rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(11,27,63,0.08)]"
      loading="lazy"
    />
  `,
})
export class Flag {
  readonly code = input.required<string>();
  readonly size = input(24);

  protected readonly src = computed(() => `https://flagcdn.com/w80/${this.code().toLowerCase()}.png`);
}
