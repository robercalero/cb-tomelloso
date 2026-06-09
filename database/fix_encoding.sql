-- ============================================================
-- FIX CODIFICACIÓN UTF-8 — CB TOMELLOSO (Aiven MySQL)
-- Corrige caracteres acentuados corruptos (insertados como latin1)
-- Uso: mysql -h HOST -P PORT -u USER -p cbtomelloso < fix_encoding.sql
-- ============================================================

USE cbtomelloso;

-- 1. Reparar ENUM de teams.category (estaba definido con valores corruptos)
ALTER TABLE teams
  MODIFY COLUMN category ENUM(
    'Senior Autonómica','Senior Zonal','Júnior','Cadete',
    'Infantil','Alevín','Benjamín','Minibasket'
  ) NOT NULL;

-- 2. Corregir datos de equipos
UPDATE teams SET name = 'Val Brokers CB Tomelloso - Sénior', category = 'Senior Autonómica' WHERE id = 1;
UPDATE teams SET name = 'CB Tomelloso Júnior',               category = 'Júnior'              WHERE id = 3;

-- 3. Corregir actividades
UPDATE activities SET venue = 'Pabellón San José, Tomelloso' WHERE id IN (1,2,3,4);
UPDATE activities SET title = 'Copa 1ª Autonómica Masculina',
  description = 'Tomelloso fue sede de la Copa 1ª Autonómica Masculina con Mini-Copa de categorías inferiores.'
  WHERE id = 2;
UPDATE activities SET description = 'Torneo solidario organizado por el club durante las fiestas navideñas.' WHERE id = 3;

-- 4. Corregir patrocinadores
UPDATE sponsors SET name = 'Val Brokers · Jiménez Valentín Seguros',
  description = 'Patrocinador principal del Club Baloncesto Tomelloso. Dionisio Jiménez Valentín.',
  contact_name = 'Dionisio Jiménez Valentín'
  WHERE id = 1;

-- 5. Verificación
SELECT 'teams' AS tabla, id, name, category FROM teams WHERE is_active = 1;
SELECT 'activities' AS tabla, id, title, venue FROM activities WHERE is_published = 1;
SELECT 'sponsors' AS tabla, id, name, contact_name FROM sponsors WHERE is_active = 1;
