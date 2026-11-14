import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { Icon } from '../../shared/components/icon';

/** Validador do grupo: a confirmação precisa ser igual à senha. */
function passwordsMatch(group: AbstractControl) {
  const { senha, confirmacao } = group.value;
  return confirmacao && senha !== confirmacao ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <h2 class="text-3xl font-extrabold tracking-tight text-navy-900">Crie sua conta</h2>
    <p class="mt-2 text-slate-500">Salve viagens, acompanhe o orçamento e veja relatórios.</p>

    <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (error()) {
        <p role="alert" class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <app-icon name="circle-alert" [size]="18" class="mt-0.5" /> {{ error() }}
        </p>
      }
      <div>
        <label class="label" for="nome">Nome completo</label>
        <div class="relative">
          <app-icon name="user" [size]="18" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input id="nome" class="input !pl-10" placeholder="Como você se chama?" formControlName="nome"
                 [class.input-invalid]="invalid('nome')" />
        </div>
        @if (invalid('nome')) {
          <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Informe o seu nome (mínimo de 3 letras).</p>
        }
      </div>

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

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label" for="senha">Senha</label>
          <input id="senha" type="password" class="input" placeholder="Mínimo de 8 caracteres" formControlName="senha"
                 [class.input-invalid]="invalid('senha')" />
          @if (invalid('senha')) {
            <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Mínimo de 8 caracteres.</p>
          }
        </div>
        <div>
          <label class="label" for="confirmacao">Confirmar senha</label>
          <input id="confirmacao" type="password" class="input" placeholder="Repita a senha" formControlName="confirmacao"
                 [class.input-invalid]="mismatch()" />
          @if (mismatch()) {
            <p class="field-error"><app-icon name="circle-alert" [size]="14" /> As senhas não são iguais.</p>
          }
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-full !py-3">
        <app-icon name="user-plus" [size]="17" /> Criar conta
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-slate-500">
      Já tem conta?
      <a routerLink="/login" class="font-semibold text-brand-600 hover:text-brand-700">Entrar</a>
    </p>
  `,
})
export class Register {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly toast = inject(ToastService);
  protected readonly error = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      confirmacao: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected invalid(name: 'nome' | 'email' | 'senha') {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected mismatch() {
    return this.form.hasError('senhasDiferentes') && this.form.controls.confirmacao.touched;
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nome, email } = this.form.getRawValue();
    if (this.users.emailExists(email)) {
      this.error.set('Já existe uma conta com este e-mail.');
      return;
    }
    this.auth.register(nome, email).subscribe({
      next: () => {
        this.toast.success('Conta criada. Bem-vindo ao Skyfare!');
        this.router.navigateByUrl('/viagens');
      },
      error: () => this.error.set('Não foi possível criar a conta.'),
    });
  }
}
