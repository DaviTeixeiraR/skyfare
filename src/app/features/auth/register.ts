import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/components/icon';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { senha, confirmacao } = group.value as { senha: string; confirmacao: string };
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
        </div>
        <div>
          <label class="label" for="confirmacao">Confirmar senha</label>
          <input id="confirmacao" type="password" class="input" placeholder="Repita a senha" formControlName="confirmacao"
                 [class.input-invalid]="mismatch()" />
        </div>
      </div>

      <div>
        <div class="flex gap-1.5" aria-hidden="true">
          @for (i of [0, 1, 2, 3]; track i) {
            <span class="h-1.5 flex-1 rounded-full" [class]="i < strength() ? strengthColor() : 'bg-slate-200'"></span>
          }
        </div>
        <p class="mt-1.5 text-xs text-slate-500">Força da senha: <strong class="font-semibold">{{ strengthLabel() }}</strong></p>
        @if (invalid('senha')) {
          <p class="field-error"><app-icon name="circle-alert" [size]="14" /> A senha precisa ter pelo menos 8 caracteres.</p>
        }
        @if (mismatch()) {
          <p class="field-error"><app-icon name="circle-alert" [size]="14" /> As senhas não são iguais.</p>
        }
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

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      confirmacao: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  private readonly password = toSignal(this.form.controls.senha.valueChanges, { initialValue: '' });
  private readonly submitted = signal(false);

  protected readonly strength = computed(() => {
    const s = this.password();
    let score = 0;
    if (s.length >= 8) score++;
    if (/[A-Z]/.test(s) && /[a-z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    return score;
  });
  protected readonly strengthLabel = computed(
    () => ['Muito fraca', 'Fraca', 'Média', 'Boa', 'Forte'][this.strength()],
  );
  protected readonly strengthColor = computed(
    () => ['bg-red-400', 'bg-red-400', 'bg-sun-400', 'bg-emerald-400', 'bg-emerald-500'][this.strength()],
  );

  protected invalid(name: 'nome' | 'email' | 'senha') {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  protected mismatch() {
    return this.form.hasError('senhasDiferentes') && this.form.controls.confirmacao.dirty;
  }

  protected submit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // O cadastro no JSON-Server entra na etapa de desenvolvimento.
    this.router.navigateByUrl('/login');
  }
}
