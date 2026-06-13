import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title, Meta } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, finalize } from 'rxjs';
import { ContactService } from '../../core/services/contact.service';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    ReactiveFormsModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);
  private contactService = inject(ContactService);
  private api = inject(ApiService);

  readonly isSubmitted = signal(false);
  readonly isMemberSubmitted = signal(false);
  readonly isSending = signal(false);

  readonly contactForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl('general', [Validators.required]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  readonly memberForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    category: new FormControl('adulto', [Validators.required]),
    message: new FormControl('')
  });

  readonly nameError = signal('');
  readonly emailError = signal('');
  readonly messageError = signal('');

  readonly memberNameError = signal('');
  readonly memberEmailError = signal('');

  constructor() {
    this.contactForm.valueChanges.pipe(debounceTime(200), takeUntilDestroyed()).subscribe(() => this.updateContactErrors());
    this.contactForm.statusChanges.pipe(debounceTime(200), takeUntilDestroyed()).subscribe(() => this.updateContactErrors());
    this.memberForm.valueChanges.pipe(debounceTime(200), takeUntilDestroyed()).subscribe(() => this.updateMemberErrors());
    this.memberForm.statusChanges.pipe(debounceTime(200), takeUntilDestroyed()).subscribe(() => this.updateMemberErrors());
  }

  ngOnInit(): void {
    this.title.setTitle(`Contacto - ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Contacta con el Club Baloncesto Tomelloso. Formulario de contacto y solicitud de socio.' });
    this.updateContactErrors();
    this.updateMemberErrors();
  }

  private updateContactErrors(): void {
    const name = this.contactForm.get('name');
    if (name?.touched && name?.invalid) {
      this.nameError.set(name.errors?.['required'] ? 'El nombre es obligatorio' : 'Mínimo 2 caracteres');
    } else {
      this.nameError.set('');
    }
    const email = this.contactForm.get('email');
    if (email?.touched && email?.invalid) {
      this.emailError.set(email.errors?.['required'] ? 'El email es obligatorio' : 'Email no válido');
    } else {
      this.emailError.set('');
    }
    const msg = this.contactForm.get('message');
    if (msg?.touched && msg?.invalid) {
      this.messageError.set(msg.errors?.['required'] ? 'El mensaje es obligatorio' : 'Mínimo 10 caracteres');
    } else {
      this.messageError.set('');
    }
  }

  private updateMemberErrors(): void {
    const name = this.memberForm.get('name');
    if (name?.touched && name?.invalid) {
      this.memberNameError.set('El nombre es obligatorio (mín. 2 caracteres)');
    } else {
      this.memberNameError.set('');
    }
    const email = this.memberForm.get('email');
    if (email?.touched && email?.invalid) {
      this.memberEmailError.set(email.errors?.['required'] ? 'El email es obligatorio' : 'Email no válido');
    } else {
      this.memberEmailError.set('');
    }
  }

  onSubmitContact(): void {
    if (this.isSending()) return;
    if (this.contactForm.valid) {
      this.isSending.set(true);
      const { name, email, subject, message } = this.contactForm.value;
      this.contactService.sendMessage({ name: name!, email: email!, subject: subject!, message: message! })
        .pipe(finalize(() => this.isSending.set(false)))
        .subscribe({
          next: () => {
            this.isSubmitted.set(true);
            this.contactForm.reset({ subject: 'general' });
          },
        });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  onSubmitMember(): void {
    if (this.isSending()) return;
    if (this.memberForm.valid) {
      this.isSending.set(true);
      const { name, email, phone, category } = this.memberForm.value;
      this.api.post<{ id: number }>('members', {
        name: name!,
        email: email!,
        phone: phone || undefined,
        memberType: category!,
        joinedAt: new Date().toISOString().split('T')[0],
      }).pipe(finalize(() => this.isSending.set(false)))
        .subscribe({
          next: () => {
            this.isMemberSubmitted.set(true);
            this.memberForm.reset({ category: 'adulto' });
          },
        });
    } else {
      this.memberForm.markAllAsTouched();
    }
  }

  showFieldError(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.touched && control?.invalid);
  }

  showMemberFieldError(controlName: string): boolean {
    const control = this.memberForm.get(controlName);
    return !!(control?.touched && control?.invalid);
  }
}
