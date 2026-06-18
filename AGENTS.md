# Reglas compartidas para agentes de IA — CB Tomelloso

## Stack técnico
- Frontend: Angular 21 (standalone, zoneless, signals, OnPush)
- Backend: NestJS 11 + TypeORM + MySQL (Aiven)
- Base de datos: MySQL (Aiven Cloud)
- Despliegue: GitHub → Render (auto-deploy en push a main)

## Frontend (Angular 21)
- 100% standalone components — nunca NgModules
- Siempre `ChangeDetectionStrategy.OnPush`
- Estado con `signal()`, `computed()`, `effect()`, `input()`, `output()`
- Control flow moderno: `@if`, `@for (track id)`, `@switch`, `@defer`
- Nunca `*ngIf`, `*ngFor`, `[ngSwitch]`
- `inject()` en lugar de constructor DI
- `toSignal()` con `initialValue` siempre definido
- `catchError(() => of([]))` en todos los observables HTTP

## Backend (NestJS)
- MySQL con SSL: `ssl: DB_SSL === 'REQUIRED' ? {} : false`
- `synchronize: false` en producción (NODE_ENV=production)
- Puerto dinámico: `process.env.PORT || 3000`
- Escuchar en `'0.0.0.0'` no en `'localhost'`
- CORS incluye siempre `https://cb-tomelloso.onrender.com`
- Swagger deshabilitado en producción
- Soft delete (isActive: false) en lugar de delete físico

## Base de datos
- MySQL (Aiven Cloud) — NO PostgreSQL
- SSL configurable via DB_SSL env var (DISABLED | REQUIRED)

## Git y despliegue
- Nunca committear .env con credenciales reales
- environment.production.ts apunta a URLs de Render (nunca localhost)
- frontend/public/_redirects debe existir con `/* /index.html 200`
- Un push a main = redeploy automático en Render
