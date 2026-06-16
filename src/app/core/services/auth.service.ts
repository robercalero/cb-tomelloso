import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap, catchError, of, throwError } from 'rxjs';
import { getApiBaseUrl } from '../utils/api-url.utils';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'socio' | 'visitante';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${getApiBaseUrl()}/auth`;
  private platformId = inject(PLATFORM_ID);

  readonly sessionCleared$ = new Subject<void>();

  private _currentUser = signal<AuthUser | null>(null);
  private _isLoading = signal(false);
  private _isRetrying = signal(false);
  private _token = signal<string | null>(this.getAccessToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isRetrying = this._isRetrying.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null || this._token() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isEditor = computed(() => ['admin', 'editor'].includes(this._currentUser()?.role ?? ''));

  setCurrentUser(user: AuthUser): void {
    this._currentUser.set(user);
  }

  private readonly TOKEN_KEY = 'cb_access_token';
  private readonly REFRESH_KEY = 'cb_refresh_token';

  login(email: string, password: string) {
    this._isLoading.set(true);
    return this.http.post<AuthTokens>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(tokens => {
        this.storeTokens(tokens.accessToken, tokens.refreshToken);
        this._currentUser.set(tokens.user);
        this._token.set(tokens.accessToken);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => { this.clearSession(); return of(null); }),
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  refreshToken(): Observable<{ accessToken: string } | null> {
    if (!this.isBrowser()) return of(null);
    const refresh_token = localStorage.getItem(this.REFRESH_KEY);
    if (!refresh_token) return of(null);
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/refresh`, { refreshToken: refresh_token }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        this._token.set(res.accessToken);
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private storeTokens(access: string, refresh: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
    this._token.set(access);
  }

  private clearSession() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
    }
    this._currentUser.set(null);
    this._token.set(null);
    this.sessionCleared$.next();
  }
}
