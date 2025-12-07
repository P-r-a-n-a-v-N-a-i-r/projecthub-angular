import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  authentication: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface Signup {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SendOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiBase}/auth`;
  private readonly tokenKey = 'ph_token';

  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private readonly http: HttpClient) {}

  login(body: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, body).pipe(
      tap(res => this.storeSession(res))
    );
  }

  signup(body: Signup): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/signup`, body).pipe(
      tap(res => this.storeSession(res))
    );
  }

  googleLogin(credential: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/google`, { credential }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  sendOtp(body: SendOtpDto): Observable<any> {
    return this.http.post<any>(`${this.base}/send-otp`, body);
  }

  verifyOtp(body: VerifyOtpDto): Observable<any> {
    return this.http.post<any>(`${this.base}/verify-otp`, body);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`).pipe(
      tap(user => this.currentUser$.next(user))
    );
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getToken(): string | null {
    return this.hasWindow() ? window.localStorage.getItem(this.tokenKey) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  storeSession(res: AuthResponse) {
    if (res?.token && this.hasWindow()) {
      window.localStorage.setItem(this.tokenKey, res.token);
    }
    if (res?.user) {
      this.currentUser$.next(res.user);
    }
  }

  clearSession() {
    if (this.hasWindow()) {
      window.localStorage.removeItem(this.tokenKey);
    }
    this.currentUser$.next(null);
  }

  logout() {
    this.clearSession();
  }
}
