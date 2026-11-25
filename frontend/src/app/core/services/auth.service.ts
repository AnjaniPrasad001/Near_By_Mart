import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, AuthPayload, User, UserRole } from '../models';

const TOKEN_KEY = 'nbm_token';
const USER_KEY = 'nbm_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _user = signal<User | null>(this.loadStoredUser());
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => Boolean(this._token() && this._user()));
  readonly isSeller = computed(() => this._user()?.role === 'seller');

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  register(payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }): Observable<ApiEnvelope<AuthPayload>> {
    return this.http
      .post<ApiEnvelope<AuthPayload>>(`${this.apiUrl}/register`, payload)
      .pipe(tap((res) => this.persistSession(res.data)));
  }

  login(payload: {
    email: string;
    password: string;
  }): Observable<ApiEnvelope<AuthPayload>> {
    return this.http
      .post<ApiEnvelope<AuthPayload>>(`${this.apiUrl}/login`, payload)
      .pipe(tap((res) => this.persistSession(res.data)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  private persistSession(auth: AuthPayload): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    this._token.set(auth.token);
    this._user.set(auth.user);
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
