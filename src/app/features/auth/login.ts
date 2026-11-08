import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/errors';
import { AuthService } from '../../core/services/auth.service';
import { Icon } from '../../shared/components/icon';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <h2 class="text-3xl font-extrabold tracking-tight text-navy-900">Bem-vindo de volta</h2>
    <p class="mt-2 text-slate-500">Entre para ver e planejar as suas viagens.</p>

    <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (error()) {
        <p role="alert" class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <app-icon name="circle-alert" [size]="18" class="mt-0.5" /> {{ error() }}
        </p>
      }
      <div>
        <label class="label" for="email">E-mail</label>
        <div class="relative">
          <app-icon name="mail" [size]="18" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input id="email" type="email" class="input !pl-10" placeholder="voce@email.com" formControlName="email"
                 [class.input-invalid]="invalid('email')" />
        </div>
        @if (invalid('email')) {
          <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Informe um e-mail válido.</p>
        }
      </div>

      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <label class="label !mb-0" for="senha">Senha</label>
          <a href="#" class="text-sm font-semibold text-brand-600 hover:text-brand-700" (click)="$event.preventDefault()">Esqueci a senha</a>
        </div>
        <div class="relative">
          <app-icon name="lock" [size]="18" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input id="senha" [type]="showPassword() ? 'text' : 'password'" class="input !px-10" placeholder="Sua senha"
                 formControlName="senha" [class.input-invalid]="invalid('senha')" />
          <button type="button" class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'" (click)="showPassword.set(!showPassword())">
            <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="18" />
          </button>
        </div>
        @if (invalid('senha')) {
          <p class="field-error"><app-icon name="circle-alert" [size]="14" /> A senha é obrigatória.</p>
        }
      </div>

      <label class="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" class="size-4 rounded border-slate-300 accent-brand-600" formControlName="lembrar" />
        Manter conectado
      </label>

      <button type="submit" class="btn btn-primary w-full !py-3" [disabled]="sending()">{{ sending() ? 'Entrando...' : 'Entrar' }}</button>
    </form>

    <div class="my-8 flex items-center gap-3 text-xs font-medium text-slate-400">
      <span class="h-px flex-1 bg-slate-200"></span> ou <span class="h-px flex-1 bg-slate-200"></span>
    </div>

    <a routerLink="/" class="btn btn-secondary w-full !py-3">
      <app-icon name="search" [size]="17" /> Fazer uma busca rápida sem entrar
    </a>

    <p class="mt-8 text-center text-sm text-slate-500">
      Ainda não tem conta?
      <a routerLink="/cadastro" class="font-semibold text-brand-600 hover:text-brand-700">Criar conta</a>
    </p>
  `,
})
export class Login {
  /** Rota que o guard guardou em ?redirectTo= antes de mandar para o login. */
  readonly redirectTo = input<string>();

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly showPassword = signal(false);
  protected readonly error = signal('');
  protected readonly sending = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    lembrar: [true],
  });

  protected invalid(name: 'email' | 'senha') {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, senha, lembrar } = this.form.getRawValue();
    this.error.set('');
    this.sending.set(true);
    this.auth.login(email, senha, lembrar).subscribe({
      next: () => {
        // Só aceita caminhos internos, para o link do login não levar a outro site.
        const target = this.redirectTo();
        this.router.navigateByUrl(target?.startsWith('/') && !target.startsWith('//') ? target : '/viagens');
      },
      error: (e) => {
        this.sending.set(false);
        this.error.set(errorMessage(e, 'Não foi possível entrar. Tente de novo.'));
      },
    });
  }
}
