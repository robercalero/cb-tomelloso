# CB Tomelloso — Web Oficial

## URLs de producción
- Frontend: https://cb-tomelloso-web.onrender.com
- API:      https://cb-tomelloso-api.onrender.com/api/v1

## Stack técnico
- Frontend: Angular 21 (Static Site en Render CDN)
- Backend:  NestJS 11 + TypeORM (Web Service en Render)
- Base de datos: PostgreSQL (Render managed DB)
- Deploy: GitHub → Render (auto-deploy en push a main)

## Limitaciones del tier gratuito
- El backend se duerme tras 15 minutos de inactividad
- El primer visitante puede esperar 30-60 segundos (cold start)
- Solución recomendada: configurar UptimeRobot para hacer ping a
  https://cb-tomelloso-api.onrender.com/health cada 5 minutos

## Desarrollo local
```
# Terminal 1 — Backend
cd backend && npm run start:dev

# Terminal 2 — Frontend
cd frontend && ng serve

# Base de datos local (PostgreSQL)
net start PostgreSQL
```

## Despliegue
El despliegue es automático: cualquier push a `main` activa Render.
Para forzar un redeploy manual: Dashboard Render > Manual Deploy

## Base de datos en Render
Para inicializar la BD desde cero:
```
psql "[External DB URL de Render]" -f database/schema_postgres.sql
psql "[External DB URL de Render]" -f database/seeds/001_initial_data_postgres.sql
```

## Scripts de base de datos
Para migrar datos locales a Render PostgreSQL:
```
.\scripts\deploy-db.ps1 -RenderHost "host.render.com" -RenderPort 5432 -RenderUser "user" -RenderPass "pass" -RenderDb "dbname"
```
