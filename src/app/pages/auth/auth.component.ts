import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, AuthResponse } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements AfterViewInit, OnInit {
  mode: 'login' | 'signup' = 'login';
  submitting = false;
  serverError = '';
  private googleReady = false;

  // Step control for signup
  otpSent = true;
  otpVerified = true;
  sentEmail = '';

  // Forms
  loginForm: FormGroup;
  emailForm: FormGroup;  // for OTP send step
  passwordForm: FormGroup; // for password setup step
  signupForm: FormGroup; // for compatibility with original template, optional

  // OTP custom input
  otpDigits = ['', '', '', '', '', ''];
  otpError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    // Initialize forms correctly
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(7), this.passwordValidator]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.matchPasswords }
    );

    // create a dummy signupForm for template compatibility if needed
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.matchPasswords });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const mode = params.get('mode');
      if (mode === 'signup' || mode === 'login') {
        this.mode = mode;
        this.renderGoogleButton();
      }
    });
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined';
  }

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  renderGoogleButton(): void {
    if (!this.hasWindow()) return;
    const g = (window as any).google;
    const host = document.getElementById('googleBtn');
    if (g?.accounts?.id && host) {
      host.innerHTML = '';
      g.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.onGoogleCredential(response?.credential as string),
      });
      g.accounts.id.renderButton(host, { theme: 'outline', size: 'large', width: 340 });
      this.googleReady = true;
    }
  }

  switch(mode: 'login' | 'signup'): void {
    this.mode = mode;
    this.serverError = '';
    if (mode === 'signup') {
      this.otpSent = false;
      this.otpVerified = false;
      this.sentEmail = '';
      this.otpDigits = ['', '', '', '', '', ''];
      this.emailForm.reset();
      this.passwordForm.reset();
      this.signupForm.reset();
    }
    this.renderGoogleButton();
  }

  get lf() {
    return this.loginForm.controls;
  }
  get sf() {
    return this.signupForm.controls;
  }

  // === Submit handlers ===

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.serverError = '';
    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: e => {
        this.submitting = false;
        this.serverError = e?.error?.message || 'Login failed';
      },
    });
  }

  submitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.serverError = '';
    const email = this.emailForm.value.email!;
    this.auth.sendOtp({ email }).subscribe({
      next: () => {
        this.submitting = false;
        this.otpSent = true;
        this.sentEmail = email;
        this.otpDigits = ['', '', '', '', '', ''];
      },
      error: e => {
        this.submitting = false;
        this.serverError = e?.error?.message || 'Failed to send OTP';
      }
    });
  }

  onOtpInput(idx: number, event: Event) {
    // Only allow number, one char per box, auto-advance
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 1) {
      val = val.charAt(0);
    }
    this.otpDigits[idx] = val;
    input.value = val;

    // Auto-advance to next on digit input
    if (val && idx < 5) {
      const next = input.nextElementSibling as HTMLInputElement;
      if (next) next.focus();
    }
    // Auto-back on backspace
    if (!val && idx > 0 && (event as KeyboardEvent).key === 'Backspace') {
      const prev = input.previousElementSibling as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  submitOtp(): void {
    if (this.otpDigits.some(d => !d || d.length !== 1)) {
      this.otpError = "Please fill all fields";
      return;
    }
    this.otpError = '';
    const otp = this.otpDigits.join('');
    this.auth.verifyOtp({ email: this.sentEmail, otp }).subscribe({
      next: () => {
        this.otpVerified = true;
      },
      error: (e) => {
        this.otpError = e.error?.message || "OTP verification failed";
      }
    });
  }

  get otpInvalid() {
    return this.otpDigits.some(d => !d || d.length !== 1);
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.serverError = '';
    const { password, confirmPassword } = this.passwordForm.value;
    this.auth.signup({
      name: this.emailForm.value.email, // or ask for name separately
      email: this.sentEmail,
      password,
      confirmPassword
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: e => {
        this.submitting = false;
        this.serverError = e?.error?.message || 'Sign up failed';
      }
    });
  }

  onGoogleCredential(credential: string): void {
    if (!credential) return;
    this.submitting = true;
    this.serverError = '';
    this.auth.googleLogin(credential).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: e => {
        this.submitting = false;
        this.serverError = e?.error?.message || 'Google sign-in failed';
      }
    });
  }

  // Validators
  matchPasswords(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { mismatch: true } : null;
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const valid = hasUpper && hasLower && hasNumber && value.length >= 7;
    return valid ? null : { passwordStrength: true };
  }
}
