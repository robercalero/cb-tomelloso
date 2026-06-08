-- ============================================================
-- SEEDS INICIALES — CB TOMELLOSO
-- Datos reales del club para la temporada 2025/2026
-- ============================================================

USE cbtomelloso;

-- -----------------------------------------------------------
-- EQUIPOS
-- -----------------------------------------------------------
INSERT INTO `teams` (`name`, `category`, `season`, `coach`, `is_active`) VALUES
('Val Brokers CB Tomelloso - Sénior', 'Senior Autonómica', '2025/2026', 'Por confirmar', 1),
('CB Tomelloso B - Zonal', 'Senior Zonal', '2025/2026', 'Por confirmar', 1),
('CB Tomelloso Júnior', 'Júnior', '2025/2026', 'Por confirmar', 1),
('CB Tomelloso Cadete', 'Cadete', '2025/2026', 'Por confirmar', 1),
('CB Tomelloso Minibasket', 'Minibasket', '2025/2026', 'Por confirmar', 1);

-- -----------------------------------------------------------
-- PATROCINADORES
-- -----------------------------------------------------------
INSERT INTO `sponsors` (`name`, `logo_url`, `website_url`, `tier`, `description`, `contact_name`, `sort_order`, `is_active`) VALUES
('Val Brokers · Jiménez Valentín Seguros', '/assets/sponsors/valbrokers.png', '#', 'principal',
 'Patrocinador principal del Club Baloncesto Tomelloso. Dionisio Jiménez Valentín.', 'Dionisio Jiménez Valentín', 1, 1),
('Ayuntamiento de Tomelloso', '/assets/sponsors/ayuntamiento.png', 'https://www.tomelloso.es', 'oro',
 'Colaborador institucional del club.', NULL, 2, 1),
('Patrocinador Plata', '/assets/sponsors/placeholder-plata.png', '#', 'plata', NULL, NULL, 10, 1),
('Patrocinador Bronce', '/assets/sponsors/placeholder-bronce.png', '#', 'bronce', NULL, NULL, 20, 1);

-- -----------------------------------------------------------
-- ACTIVIDADES
-- -----------------------------------------------------------
INSERT INTO `activities` (`title`, `description`, `activity_type`, `start_date`, `venue`, `is_published`) VALUES
('Escuela de Verano de Baloncesto 2025', 'Organizada junto al Ayuntamiento de Tomelloso.', 'escuela', '2025-07-01', 'Pabellón San José, Tomelloso', 1),
('Copa 1ª Autonómica Masculina', 'Tomelloso fue sede de la Copa 1ª Autonómica Masculina con Mini-Copa de categorías inferiores.', 'copa', '2025-01-18', 'Pabellón San José, Tomelloso', 1),
('Torneo Solidario de Navidad', 'Torneo solidario organizado por el club durante las fiestas navideñas.', 'torneo', '2024-12-21', 'Pabellón San José, Tomelloso', 1),
('Torneo de Feria de Tomelloso', 'Torneo tradicional celebrado durante las Fiestas de la Vendimia de Tomelloso.', 'torneo', '2025-09-07', 'Pabellón San José, Tomelloso', 1);
