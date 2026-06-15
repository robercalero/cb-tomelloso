import { Injectable, inject, signal, computed } from '@angular/core';
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

  readonly sessionCleared$ = new Subject<void>();

  private _currentUser = signal<AuthUser | null>(null);
  private _isLoading = signal(false);
  private _isRetrying = signal(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isRetrying = this._isRetrying.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null || !!this.getAccessToken());
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

  refreshToken(): Observable<{ accessToken: string } | null> {
    const refresh_token = localStorage.getItem(this.REFRESH_KEY);
    if (!refresh_token) return of(null);
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/refresh`, { refreshToken: refresh_token }).pipe(
      tap(res => localStorage.setItem(this.TOKEN_KEY, res.accessToken)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeTokens(access: string, refresh: string) {
    localStorage.setItem(this.TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
  }

  private clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this._currentUser.set(null);
    this.sessionCleared$.next();
  }
}
