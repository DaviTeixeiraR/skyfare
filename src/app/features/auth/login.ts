import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
        <label class="label" for="senha">Senha</label>
        <div class="relative">
          <app-icon name="lock" [size]="18" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input id="senha" type="password" class="input !pl-10" placeholder="Sua senha" formControlName="senha"
                 [class.input-invalid]="invalid('senha')" />
        </div>
        @if (invalid('senha')) {
          <p class="field-error"><app-icon name="circle-alert" [size]="14" /> A senha é obrigatória.</p>
        }
      </div>

      <button type="submit" class="btn btn-primary w-full !py-3">Entrar</button>
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
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly error = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected invalid(name: 'email' | 'senha') {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, senha } = this.form.getRawValue();
    if (this.auth.login(email, senha)) {
      this.router.navigateByUrl('/viagens');
    } else {
      this.error.set('E-mail ou senha incorretos.');
    }
  }
}
