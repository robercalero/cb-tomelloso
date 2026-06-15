# Migraciones de Base de Datos — CB Tomelloso

Este directorio contiene migraciones SQL para aplicar cambios en la base de datos MySQL (Aiven Cloud).

## Cómo aplicar migraciones

1. Conéctate a la base de datos Aiven vía CLI o HeidiSQL
2. Ejecuta el contenido del archivo de migración correspondiente

## Migraciones disponibles

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `001_create_admin_user.sql` | Creación del usuario admin inicial | Pendiente |
| `002_add_junior_u19_category.sql` | Añade 'Junior U19' al ENUM de teams.category | Pendiente |

## Notas

- Las migraciones se ejecutan directamente en Aiven MySQL, NO mediante TypeORM synchronize
- Siempre hacer backup antes de ejecutar migraciones en producción
