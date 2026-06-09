# CB Tomelloso — Contexto del proyecto para Antigravity

## Identidad del proyecto
Eres el agente de desarrollo de la **web oficial del Club Baloncesto Tomelloso**
(Val Brokers C.B. Tomelloso), un club de baloncesto de Tomelloso, Ciudad Real, España.

## Stack técnico
- **Frontend:** Angular 21 (standalone, zoneless, signals, Signal Forms, @defer, OnPush)
- **Backend:** NestJS 11 + TypeORM + PostgreSQL
- **Base de datos:** PostgreSQL (Render managed, migrada desde MariaDB)
- **Despliegue:** GitHub → Render (auto-deploy en push a `main`)
- **URLs producción:**
  - Frontend: https://cb-tomelloso-web.onrender.com
  - API: https://cb-tomelloso-api.onrender.com/api/v1

## Estructura del monorepo
```
cb-tomelloso/
  frontend/   ← Angular 21 (Static Site en Render)
  backend/    ← NestJS 11 (Web Service en Render)
  database/   ← Esquemas SQL y seeds PostgreSQL
  render.yaml ← Config de despliegue Render
  GEMINI.md   ← Este archivo
  AGENTS.md   ← Reglas compartidas
```

## Reglas de comportamiento del agente

### General
- Usa SIEMPRE Plan Mode para tareas que toquen más de 2 archivos
- Antes de escribir código: lee los archivos existentes del área afectada
- Nunca elimines código sin confirmar que no tiene usarios
- Si tienes dudas sobre si eliminar algo, NO lo elimines — márcalo como duda

### Frontend (Angular 21)
- 100% standalone components — nunca NgModules
- Siempre `ChangeDetectionStrategy.OnPush`
- Estado con `signal()`, `computed()`, `effect()`, `input()`, `output()`
- Control flow moderno: `@if`, `@for (track id)`, `@switch`, `@defer`
- Nunca `*ngIf`, `*ngFor`, `[ngSwitch]` — son la sintaxis antigua
- `inject()` en lugar de constructor DI
- `toSignal()` con `initialValue` siempre definido
- `catchError(() => of([]))` en todos los observables HTTP
- Siempre importar en el array `imports[]` del componente lo que se usa en el template

### Backend (NestJS)
- PostgreSQL con SSL en producción: `ssl: { rejectUnauthorized: false }`
- `synchronize: false` en producción (NODE_ENV=production)
- Puerto dinámico: `process.env.PORT || 3000`
- Escuchar en `'0.0.0.0'` no en `'localhost'`
- CORS incluye siempre `https://cb-tomelloso-web.onrender.com`
- Swagger deshabilitado en producción
- Soft delete (isActive: false) en lugar de delete físico

### Base de datos
- PostgreSQL — NO MySQL ni MariaDB
- Tipos PostgreSQL: `SERIAL`, `BOOLEAN`, `SMALLINT`, `TIMESTAMPTZ`, `TEXT`
- No usar tipos MySQL: `TINYINT(1)`, `AUTO_INCREMENT`, `YEAR`, `LONGTEXT`

### Git y despliegue
- Nunca committear `.env` con credenciales reales
- `environment.production.ts` apunta a las URLs de Render (nunca localhost)
- `frontend/public/_redirects` debe existir con `/* /index.html 200`
- Commit messages en español descriptivos
- Un push a `main` = redeploy automático en Render

### Identidad visual del club
- Colores: azul `#1a5276` (primario) + verde `#1e8449` (secundario) + naranja `#f39c12` (accent)
- Fuentes: Barlow Condensed (headings) + Inter (body)
- Patrocinador principal: Val Brokers / Jiménez Valentín Seguros
- Hashtag oficial: #CreciendoJuntos
- Pabellón: San José, Tomelloso (Ciudad Real)
