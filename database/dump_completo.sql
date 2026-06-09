-- ============================================================
-- CB Tomelloso — dump completo
-- Generado: 2026-06-09T11:08:07.934Z
-- ============================================================

CREATE DATABASE IF NOT EXISTS cbtomelloso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cbtomelloso;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `activities`;
CREATE TABLE "activities" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "title" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "description" text COLLATE utf8mb4_unicode_ci,
  "activity_type" enum('torneo','escuela','evento','copa','amistoso','otro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'otro',
  "start_date" date NOT NULL,
  "end_date" date DEFAULT NULL,
  "venue" varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "image_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "is_published" tinyint(1) NOT NULL DEFAULT '1',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

INSERT INTO `activities` (`id`, `title`, `description`, `activity_type`, `start_date`, `end_date`, `venue`, `image_url`, `is_published`, `created_at`, `updated_at`) VALUES (1, 'Escuela de Verano de Baloncesto 2025', 'Organizada junto al Ayuntamiento de Tomelloso.', 'escuela', '2025-06-30 22:00:00', NULL, 'Pabellón San José, Tomelloso', NULL, 1, '2026-06-05 20:03:14', '2026-06-09 08:39:43');
INSERT INTO `activities` (`id`, `title`, `description`, `activity_type`, `start_date`, `end_date`, `venue`, `image_url`, `is_published`, `created_at`, `updated_at`) VALUES (2, 'Copa 1ª Autonómica Masculina', 'Tomelloso fue sede de la Copa 1ª Autonómica Masculina con Mini-Copa de categorías inferiores.', 'copa', '2025-01-17 23:00:00', NULL, 'Pabellón San José, Tomelloso', NULL, 1, '2026-06-05 20:03:14', '2026-06-09 08:39:59');
INSERT INTO `activities` (`id`, `title`, `description`, `activity_type`, `start_date`, `end_date`, `venue`, `image_url`, `is_published`, `created_at`, `updated_at`) VALUES (3, 'Torneo Solidario de Navidad', 'Torneo solidario organizado por el club durante las fiestas navideñas.', 'torneo', '2024-12-20 23:00:00', NULL, 'Pabellón San José, Tomelloso', NULL, 1, '2026-06-05 20:03:14', '2026-06-09 08:40:14');
INSERT INTO `activities` (`id`, `title`, `description`, `activity_type`, `start_date`, `end_date`, `venue`, `image_url`, `is_published`, `created_at`, `updated_at`) VALUES (4, 'Torneo de Feria de Tomelloso', 'Torneo tradicional celebrado durante las Fiestas de la Vendimia de Tomelloso.', 'torneo', '2025-09-06 22:00:00', NULL, 'Pabellón San José, Tomelloso', NULL, 1, '2026-06-05 20:03:14', '2026-06-09 08:39:43');

DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE "contact_messages" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "name" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "subject" enum('general','socio','patrocinio','prensa','otro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  "message" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "ip_address" varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "is_read" tinyint(1) NOT NULL DEFAULT '0',
  "replied_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `message`, `ip_address`, `is_read`, `replied_at`, `created_at`) VALUES (1, 'rfe', 'frefe@hotmail.com', 'patrocinio', 'erfrefreferferferf', '::1', 0, NULL, '2026-06-07 20:15:52');

DROP TABLE IF EXISTS `gallery`;
CREATE TABLE "gallery" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "team_id" int unsigned DEFAULT NULL,
  "title" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "media_type" enum('image','video') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image',
  "url" varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  "thumbnail_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "season" varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "event_name" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "taken_at" date DEFAULT NULL,
  "is_published" tinyint(1) NOT NULL DEFAULT '1',
  "sort_order" smallint unsigned NOT NULL DEFAULT '99',
  "created_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS `matches`;
CREATE TABLE "matches" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "team_id" int unsigned NOT NULL,
  "home_team_logo" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "away_team_logo" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "match_date" date NOT NULL,
  "match_time" time NOT NULL,
  "competition" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "venue" varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  "is_home" tinyint(1) NOT NULL DEFAULT '1',
  "score_home" tinyint unsigned DEFAULT NULL,
  "score_away" tinyint unsigned DEFAULT NULL,
  "status" enum('scheduled','live','finished','postponed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  "notes" text COLLATE utf8mb4_unicode_ci,
  "homeTeam" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "awayTeam" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  "updated_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY ("id")
);

INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (13, 1, NULL, NULL, '2025-10-25 22:00:00', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José', 1, 105, 64, 'finished', NULL, 'Val Brokers CB Tomelloso', 'Basket Cervantes', '2026-06-09 08:57:41', '2026-06-09 08:57:41');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (14, 1, NULL, NULL, '2025-12-14 23:00:00', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José', 1, 73, 75, 'finished', NULL, 'Val Brokers CB Tomelloso', 'UCA', '2026-06-09 08:57:41', '2026-06-09 08:57:41');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (15, 1, NULL, NULL, '2026-01-23 23:00:00', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José', 1, 93, 73, 'finished', NULL, 'Val Brokers CB Tomelloso', 'CB Miguel Esteban', '2026-06-09 08:57:41', '2026-06-09 08:57:41');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (16, 1, NULL, NULL, '2026-03-13 23:00:00', '18:00:00', 'Play Off 1ª Autonómica', 'Pabellón Municipal Bolaños', 0, 73, 71, 'finished', NULL, 'CB Bolaños - García Hermanos', 'Val Brokers CB Tomelloso', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (17, 1, NULL, NULL, '2026-09-19 22:00:00', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José', 1, NULL, NULL, 'scheduled', NULL, 'Val Brokers CB Tomelloso', 'Opticalia Manzanares', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (18, 1, NULL, NULL, '2026-10-03 22:00:00', '18:30:00', 'Liga STM 1ª Autonómica', 'Pabellón San José', 1, NULL, NULL, 'scheduled', NULL, 'Val Brokers CB Tomelloso', 'UCA', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (19, 1, NULL, NULL, '2026-10-10 22:00:00', '12:00:00', 'Liga STM 1ª Autonómica', 'Pabellón Hellín', 0, NULL, NULL, 'scheduled', NULL, 'ADB Hellín', 'Val Brokers CB Tomelloso', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (20, 3, NULL, NULL, '2026-01-09 23:00:00', '17:00:00', 'Liga U19 Masculina', 'Pabellón San José', 1, 54, 46, 'finished', NULL, 'CB Tomelloso U19 Amarillo', 'Argamasilla U19', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (21, 3, NULL, NULL, '2026-01-23 23:00:00', '16:00:00', 'Liga U19 Masculina', 'Pabellón San José', 1, 89, 20, 'finished', NULL, 'CB Tomelloso U19 Amarillo', 'CB Miguel Esteban U19', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (22, 3, NULL, NULL, '2026-02-21 23:00:00', '12:00:00', 'Liga U19 Masculina', 'Pabellón Miguelturra', 0, NULL, NULL, 'finished', NULL, 'Miguelturra U19', 'CB Tomelloso U19 Amarillo', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (23, 3, NULL, NULL, '2026-03-07 23:00:00', '17:00:00', 'Liga U19 Masculina', 'Pabellón San José', 1, 78, 45, 'finished', NULL, 'CB Tomelloso U19 Amarillo', 'Basket Cervantes U19', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (24, 3, NULL, NULL, '2026-03-28 23:00:00', '17:00:00', 'Liga U19 Masculina', 'Pabellón San José', 1, 80, 48, 'finished', NULL, 'CB Tomelloso U19 Amarillo', 'Puertollano U19', '2026-06-09 08:57:42', '2026-06-09 08:57:42');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (25, 3, NULL, NULL, '2026-09-27 22:00:00', '17:00:00', 'Liga U19 Masculina', 'Pabellón San José', 1, NULL, NULL, 'scheduled', NULL, 'CB Tomelloso U19 Amarillo', 'ADB Hellín U19', '2026-06-09 08:57:43', '2026-06-09 08:57:43');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (26, 7, NULL, NULL, '2026-03-28 23:00:00', '12:00:00', 'Liga U19 Masculina', 'Pabellón Miguelturra', 0, 120, 27, 'finished', NULL, 'Miguelturra U19', 'CB Tomelloso U19 Verde', '2026-06-09 08:57:43', '2026-06-09 08:57:43');
INSERT INTO `matches` (`id`, `team_id`, `home_team_logo`, `away_team_logo`, `match_date`, `match_time`, `competition`, `venue`, `is_home`, `score_home`, `score_away`, `status`, `notes`, `homeTeam`, `awayTeam`, `created_at`, `updated_at`) VALUES (27, 7, NULL, NULL, '2026-09-27 22:00:00', '17:00:00', 'Liga U19 Masculina', 'Pabellón San Antonio', 1, NULL, NULL, 'scheduled', NULL, 'CB Tomelloso U19 Verde', 'Opticalia Manzanares U19', '2026-06-09 08:57:43', '2026-06-09 08:57:43');

DROP TABLE IF EXISTS `members`;
CREATE TABLE "members" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "user_id" int unsigned DEFAULT NULL,
  "name" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "phone" varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "member_type" enum('adulto','juvenil','familia','honorario') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'adulto',
  "member_number" varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "joined_at" date NOT NULL,
  "is_active" tinyint(1) NOT NULL DEFAULT '1',
  "created_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  "updated_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY ("id"),
  UNIQUE KEY "IDX_bab9dbf94db02b1b0dd6384607" ("member_number")
);

DROP TABLE IF EXISTS `news`;
CREATE TABLE "news" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "author_id" int unsigned DEFAULT NULL,
  "title" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "slug" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "excerpt" varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  "content" longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  "category" enum('resultado','club','cantera','evento','general') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  "image_url" text COLLATE utf8mb4_unicode_ci,
  "is_published" tinyint(1) NOT NULL DEFAULT '0',
  "published_at" timestamp NULL DEFAULT NULL,
  "source" enum('instagram','twitter','facebook','youtube','web') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "source_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "views" int unsigned NOT NULL DEFAULT '0',
  "created_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  "updated_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  "media" longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY ("id"),
  UNIQUE KEY "IDX_d09152c44881b7620e12d6df09" ("slug"),
  CONSTRAINT "news_chk_1" CHECK (json_valid(`media`))
);

INSERT INTO `news` (`id`, `author_id`, `title`, `slug`, `excerpt`, `content`, `category`, `image_url`, `is_published`, `published_at`, `source`, `source_url`, `views`, `created_at`, `updated_at`, `media`) VALUES (6, NULL, '🏀ACTIVIDAD🏀', 'instagram-actividad-DY-PpZVDYHe', '🏀ACTIVIDAD🏀

Ya está aquí el CAMPUS de VERANO del CBT

🗓️ 22 junio al 3 julio
📍 Pabellón “San José”
💵 1 Semana 40€
💵 2 Semanas 60€
📝 Inscripciones 29 mayo al 17 junio

🔗 Formulario inscripción: https://publuu.com/flip-book/1119234/2491179

#valbrokerscbtomelloso
#creciendojuntos', '<p>🏀ACTIVIDAD🏀</p><p></p><p>Ya está aquí el CAMPUS de VERANO del CBT</p><p></p><p>🗓️ 22 junio al 3 julio</p><p>📍 Pabellón “San José”</p><p>💵 1 Semana 40€</p><p>💵 2 Semanas 60€</p><p>📝 Inscripciones 29 mayo al 17 junio</p><p></p><p>🔗 Formulario inscripción: https://publuu.com/flip-book/1119234/2491179</p><p></p><p>#valbrokerscbtomelloso</p><p>#creciendojuntos</p>', 'general', '/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F710795044_18152438698485493_7482539620793489483_n.jpg%3Fstp%3Ddst-jpg_e15_fr_s1080x1080_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gHA4DxaWoOykUvNd0BZPDiDFbzcjCmWeFmg6-18n46eDlYmIb-LTkhFFgM3TJtZYvU%26_nc_ohc%3DcZDb-_LYBzsQ7kNvwG_Ik7a%26_nc_gid%3DFWwYCtvIc2j9wAL3VedEpQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af9acdwvyb9R6R6dq25qEniW9kpu14DScwvX_El2enqWDA%26oe%3D6A2C3802%26_nc_sid%3Dd885a2', 1, '2026-06-08 04:18:10', 'instagram', 'https://www.instagram.com/p/DY-PpZVDYHe/', 2, '2026-06-08 08:18:10', '2026-06-08 15:12:30', '[{"url":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F710795044_18152438698485493_7482539620793489483_n.jpg%3Fstp%3Ddst-jpg_e15_fr_s1080x1080_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gHA4DxaWoOykUvNd0BZPDiDFbzcjCmWeFmg6-18n46eDlYmIb-LTkhFFgM3TJtZYvU%26_nc_ohc%3DcZDb-_LYBzsQ7kNvwG_Ik7a%26_nc_gid%3DFWwYCtvIc2j9wAL3VedEpQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af9acdwvyb9R6R6dq25qEniW9kpu14DScwvX_El2enqWDA%26oe%3D6A2C3802%26_nc_sid%3Dd885a2","type":"image"},{"url":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F712583720_18152438707485493_10585691857257584_n.jpg%3Fstp%3Ddst-jpg_e15_fr_s1080x1080_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gHA4DxaWoOykUvNd0BZPDiDFbzcjCmWeFmg6-18n46eDlYmIb-LTkhFFgM3TJtZYvU%26_nc_ohc%3DLWRtuuhqPf4Q7kNvwERjRLN%26_nc_gid%3DFWwYCtvIc2j9wAL3VedEpQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af9rOtZ7h8Sda-JSYbFCQNgoc6IVX3ZDjoNwuiA6wzVpnA%26oe%3D6A2C45F3%26_nc_sid%3Dd885a2","type":"image"}]');
INSERT INTO `news` (`id`, `author_id`, `title`, `slug`, `excerpt`, `content`, `category`, `image_url`, `is_published`, `published_at`, `source`, `source_url`, `views`, `created_at`, `updated_at`, `media`) VALUES (7, NULL, '🏀ACTIVIDAD🏀', 'instagram-actividad-DXzm3LhDTLU', '🏀ACTIVIDAD🏀

Inscríbete en una nueva edición de la ESCUELA de VERANO del CBT:

🗓️ 1 al 27 junio
📍 Pabellón “San José”
💵 35€
📝 Inscripciones del 5 al 23 mayo

🔗 Formulario inscripción: smallpdf.com/es/file#s=6837…

#valbrokerscbtomelloso
#creciendojuntos', '<p>🏀ACTIVIDAD🏀</p><p></p><p>Inscríbete en una nueva edición de la ESCUELA de VERANO del CBT:</p><p></p><p>🗓️ 1 al 27 junio</p><p>📍 Pabellón “San José”</p><p>💵 35€</p><p>📝 Inscripciones del 5 al 23 mayo</p><p></p><p>🔗 Formulario inscripción: smallpdf.com/es/file#s=6837…</p><p></p><p>#valbrokerscbtomelloso</p><p>#creciendojuntos</p>', 'general', '/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F684162094_18149402761485493_6644784074357508954_n.jpg%3Fstp%3Ddst-jpg_e35_s1080x1080_sh2.08_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gG4adbomQiiHxmGOYrDaixwe6HL4izpz-zsyoNhJQ03JVOUsKKFo-e9u1I-zaEVMmA%26_nc_ohc%3Dog2Qx3KQ3NEQ7kNvwGox_vh%26_nc_gid%3D9tfhpN8zxtB-IZcFRV0_QQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af9HfhDOr5FCoFDkfzlvI3XhQZZ2lYT_IWdelI_K49A1lQ%26oe%3D6A2C5780%26_nc_sid%3Dd885a2', 1, '2026-06-08 04:18:15', 'instagram', 'https://www.instagram.com/p/DXzm3LhDTLU/', 6, '2026-06-08 08:18:15', '2026-06-08 14:09:00', '[{"url":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F684162094_18149402761485493_6644784074357508954_n.jpg%3Fstp%3Ddst-jpg_e35_s1080x1080_sh2.08_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gG4adbomQiiHxmGOYrDaixwe6HL4izpz-zsyoNhJQ03JVOUsKKFo-e9u1I-zaEVMmA%26_nc_ohc%3Dog2Qx3KQ3NEQ7kNvwGox_vh%26_nc_gid%3D9tfhpN8zxtB-IZcFRV0_QQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af9HfhDOr5FCoFDkfzlvI3XhQZZ2lYT_IWdelI_K49A1lQ%26oe%3D6A2C5780%26_nc_sid%3Dd885a2","type":"image"},{"url":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F684155351_18149402758485493_2863976724298618591_n.jpg%3Fstp%3Ddst-jpg_e35_s1080x1080_sh2.08_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gG4adbomQiiHxmGOYrDaixwe6HL4izpz-zsyoNhJQ03JVOUsKKFo-e9u1I-zaEVMmA%26_nc_ohc%3DFjSc97miNo8Q7kNvwEsEi4o%26_nc_gid%3D9tfhpN8zxtB-IZcFRV0_QQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af_qHeJbjW_tHhCuueZoQTQqy1VJm7rtkApbI0Ktb5NIiA%26oe%3D6A2C49E1%26_nc_sid%3Dd885a2","type":"image"},{"url":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F685102139_18149402770485493_3037724537760884240_n.jpg%3Fstp%3Ddst-jpg_e35_s1080x1080_sh2.08_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gG4adbomQiiHxmGOYrDaixwe6HL4izpz-zsyoNhJQ03JVOUsKKFo-e9u1I-zaEVMmA%26_nc_ohc%3D1MQXOCg0jrEQ7kNvwF72-LK%26_nc_gid%3D9tfhpN8zxtB-IZcFRV0_QQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af8G9vIZUZUeTWmZ-YNkJs5bjDsRVTGeslcnoAc1vB7Nug%26oe%3D6A2C5D7B%26_nc_sid%3Dd885a2","type":"image"},{"url":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-2.fna.fbcdn.net%2Fv%2Ft51.82787-15%2F684641988_18149402779485493_2259815408391650653_n.jpg%3Fstp%3Ddst-jpg_e35_s1080x1080_sh2.08_tt6%26_nc_ht%3Dinstagram.fsvq2-2.fna.fbcdn.net%26_nc_cat%3D101%26_nc_oc%3DQ6cZ2gG4adbomQiiHxmGOYrDaixwe6HL4izpz-zsyoNhJQ03JVOUsKKFo-e9u1I-zaEVMmA%26_nc_ohc%3DsK2Tf-3xON4Q7kNvwEOhhI6%26_nc_gid%3D9tfhpN8zxtB-IZcFRV0_QQ%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af-O--VZgIrtAQ4ViJmF6Z9DfF8iv7n-k_foyIWDc6FpqQ%26oe%3D6A2C66D1%26_nc_sid%3Dd885a2","type":"image"}]');
INSERT INTO `news` (`id`, `author_id`, `title`, `slug`, `excerpt`, `content`, `category`, `image_url`, `is_published`, `published_at`, `source`, `source_url`, `views`, `created_at`, `updated_at`, `media`) VALUES (8, NULL, '🏀CAMPUS VERANO CBT🏀', 'instagram-campus-verano-cbt-DZPw5nAtLW2', '🏀CAMPUS VERANO CBT🏀
 
Aaron, directo técnico del campus, y Miguel, uno de los entrenadores, nos hablan de la actividad

Puedes inscribirte hasta el 17 de junio, te esperamos‼️

#valbrokerscbtomelloso
#creciendojuntos', '<p>🏀CAMPUS VERANO CBT🏀</p><p> </p><p>Aaron, directo técnico del campus, y Miguel, uno de los entrenadores, nos hablan de la actividad</p><p></p><p>Puedes inscribirte hasta el 17 de junio, te esperamos‼️</p><p></p><p>#valbrokerscbtomelloso</p><p>#creciendojuntos</p>', 'general', '/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-1.fna.fbcdn.net%2Fv%2Ft51.71878-15%2F716330522_2998523720479690_2674682855780963788_n.jpg%3Fstp%3Ddst-jpg_e15_tt6%26_nc_ht%3Dinstagram.fsvq2-1.fna.fbcdn.net%26_nc_cat%3D110%26_nc_oc%3DQ6cZ2gE148uV3eAuL_yVSXrJiV21xPfJtlJnjwCF-HM2K8vAlAz72laTUu8Igx8B8PYRgWU%26_nc_ohc%3D2jtzlZbRVoAQ7kNvwEnDRVR%26_nc_gid%3DJCqsolZ-4d08h-TK1AyH9A%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af-kXFoRJfiXJxXwlMvInLmKJpr2GHCPdkAdvRbbnXZBXA%26oe%3D6A2C4029%26_nc_sid%3Dd885a2', 1, '2026-06-08 04:18:22', 'instagram', 'https://www.instagram.com/p/DZPw5nAtLW2/', 7, '2026-06-08 08:18:22', '2026-06-08 17:32:01', '[{"url":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-1.fna.fbcdn.net%2Fo1%2Fv%2Ft2%2Ff2%2Fm86%2FAQPXZzbYHnqvEO7ye3_oQNw9hlh9zV_R5GVyFIZ4uy-3hWsAO3I5i5QC1ncn7Z5iRsgEpo804B5fDosj6mwsF73ykSY0XogYFZXJKuI.mp4%3F_nc_cat%3D111%26_nc_oc%3DAdpm-ocWEpdVWLtVE0_78YxVDlB56ruhYmRr7DTt9YHUxlWUqYcp_Lnp160zm38Gq0E%26_nc_sid%3D5e9851%26_nc_ht%3Dinstagram.fsvq2-1.fna.fbcdn.net%26_nc_ohc%3DDhDcEhLroW8Q7kNvwGC8xyE%26efg%3DeyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNDgwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTcyOTQ1NzU2NTE1Njc4OSwiYXNzZXRfYWdlX2RheXMiOjEsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjo3OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9%26ccb%3D17-1%26vs%3Dab122d9a134347d6%26_nc_vs%3DHBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC80MzREODg1MEZCMjA3Q0REN0YwNTIwQjE5MjhFNkY5QV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzI0NDk1NzgyRUYxOEU1MUY5RDk1RDZDRTZEQzEyNjkzX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbqlpr91ruSBhUCKAJDMywXQFPCHKwIMScYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA%26_nc_gid%3DJCqsolZ-4d08h-TK1AyH9A%26_nc_zt%3D28%26_nc_ss%3D7a22e%26oh%3D00_Af82RmqEqhpFD6pLtvkLbbudqxTUBN3LqfyI_W0eWhSfPw%26oe%3D6A287198","type":"video","thumbnail":"/api/v1/media/proxy?url=https%3A%2F%2Finstagram.fsvq2-1.fna.fbcdn.net%2Fv%2Ft51.71878-15%2F716330522_2998523720479690_2674682855780963788_n.jpg%3Fstp%3Ddst-jpg_e15_tt6%26_nc_ht%3Dinstagram.fsvq2-1.fna.fbcdn.net%26_nc_cat%3D110%26_nc_oc%3DQ6cZ2gE148uV3eAuL_yVSXrJiV21xPfJtlJnjwCF-HM2K8vAlAz72laTUu8Igx8B8PYRgWU%26_nc_ohc%3D2jtzlZbRVoAQ7kNvwEnDRVR%26_nc_gid%3DJCqsolZ-4d08h-TK1AyH9A%26edm%3DANTKIIoBAAAA%26ccb%3D7-5%26oh%3D00_Af-kXFoRJfiXJxXwlMvInLmKJpr2GHCPdkAdvRbbnXZBXA%26oe%3D6A2C4029%26_nc_sid%3Dd885a2"}]');

DROP TABLE IF EXISTS `players`;
CREATE TABLE "players" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "team_id" int unsigned NOT NULL,
  "name" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "surname" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "dorsal" tinyint unsigned DEFAULT NULL,
  "position" enum('Base','Escolta','Alero','Ala-Pívot','Pívot') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "nationality" varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'España',
  "birth_year" year DEFAULT NULL,
  "height_cm" smallint unsigned DEFAULT NULL,
  "photo_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "is_active" tinyint(1) NOT NULL DEFAULT '1',
  "created_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  "updated_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY ("id")
);

INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (13, 1, 'Miguel Ángel', 'Lara', NULL, 'Ala-Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:37', '2026-06-09 08:57:37');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (14, 1, 'Javier', 'Blanco', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:37', '2026-06-09 08:57:37');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (15, 1, 'Daniel', 'Bonillo', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:37', '2026-06-09 08:57:37');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (16, 1, 'Adrián', 'Sánchez-Migallón', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (17, 1, 'Alonso', 'Cobo', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (18, 1, 'Javier', 'Bonillo', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (19, 1, 'Jorge', 'Tejeda', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (20, 1, 'Chema', '', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (21, 1, 'Araujo', '', NULL, 'Ala-Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (22, 1, 'Cristian', 'Grande', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (23, 1, 'Raúl', '', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (24, 1, 'Carlos', 'Madrigal', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:38', '2026-06-09 08:57:38');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (25, 1, 'Chayun', '', NULL, 'Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (26, 1, 'Cele', 'Pedroche', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (27, 1, 'Román', '', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (28, 1, 'Naranjo', '', NULL, 'Ala-Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (29, 1, 'Adrián', 'Ramírez', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (30, 3, 'Rebollo', '', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (31, 3, 'Pablo', '', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (32, 3, 'Jorge', 'Castro', NULL, 'Ala-Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (33, 3, 'Raúl', 'Ruiz', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (34, 3, 'Bryan', '', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (35, 3, 'Carlos', 'García', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (36, 3, 'Carlos', 'González', NULL, 'Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (37, 3, 'Juan', 'Darío', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:39', '2026-06-09 08:57:39');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (38, 3, 'Alejandro', '', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (39, 3, 'José', 'Ángel', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (40, 3, 'Iván', '', NULL, 'Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (41, 3, 'Lucas', 'Sánchez', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (42, 3, 'Marcial', '', NULL, 'Ala-Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (43, 7, 'Omar', 'Ezequiel', NULL, 'Ala-Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (44, 7, 'Lin', '', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (45, 7, 'Mendoza', '', NULL, 'Pívot', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (46, 7, 'Miguel', '', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (47, 7, 'Adrián', 'Garrido', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (48, 7, 'Alexis', '', NULL, 'Escolta', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:40', '2026-06-09 08:57:40');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (49, 7, 'Juan', 'Romero', NULL, 'Base', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:41', '2026-06-09 08:57:41');
INSERT INTO `players` (`id`, `team_id`, `name`, `surname`, `dorsal`, `position`, `nationality`, `birth_year`, `height_cm`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (50, 7, 'Iván', 'Lomas', NULL, 'Alero', 'España', NULL, NULL, NULL, 1, '2026-06-09 08:57:41', '2026-06-09 08:57:41');

DROP TABLE IF EXISTS `sponsors`;
CREATE TABLE "sponsors" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "name" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "logo_url" varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  "website_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "tier" enum('principal','oro','plata','bronce') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'bronce',
  "description" text COLLATE utf8mb4_unicode_ci,
  "contact_name" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "contact_email" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "is_active" tinyint(1) NOT NULL DEFAULT '1',
  "sort_order" tinyint unsigned NOT NULL DEFAULT '99',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

INSERT INTO `sponsors` (`id`, `name`, `logo_url`, `website_url`, `tier`, `description`, `contact_name`, `contact_email`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES (1, 'Val Brokers · Jiménez Valentín Seguros', '/assets/sponsors/valbrokers.png', '#', 'principal', 'Patrocinador principal del Club Baloncesto Tomelloso. Dionisio Jiménez Valentín.', 'Dionisio Jiménez Valentín', NULL, 1, 1, '2026-06-05 20:03:14', '2026-06-09 08:39:44');
INSERT INTO `sponsors` (`id`, `name`, `logo_url`, `website_url`, `tier`, `description`, `contact_name`, `contact_email`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES (2, 'Ayuntamiento de Tomelloso', '/assets/sponsors/ayuntamiento.png', 'https://www.tomelloso.es', 'oro', 'Colaborador institucional del club.', NULL, NULL, 1, 2, '2026-06-05 20:03:14', '2026-06-05 20:03:14');

DROP TABLE IF EXISTS `teams`;
CREATE TABLE "teams" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "name" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "category" enum('Senior Autonómica','Senior Zonal','Júnior','Junior U19','Cadete','Infantil','Alevín','Benjamín','Minibasket') COLLATE utf8mb4_unicode_ci NOT NULL,
  "season" varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  "coach" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "assistant_coach" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "photo_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "is_active" tinyint(1) NOT NULL DEFAULT '1',
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

INSERT INTO `teams` (`id`, `name`, `category`, `season`, `coach`, `assistant_coach`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'Val Brokers CB Tomelloso', 'Senior Autonómica', '2025/2026', 'Aaron Núñez Ventura', NULL, NULL, 1, '2026-06-05 20:03:14', '2026-06-09 08:47:53');
INSERT INTO `teams` (`id`, `name`, `category`, `season`, `coach`, `assistant_coach`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (3, 'CB Tomelloso U19 Amarillo', 'Junior U19', '2025/2026', 'Ramón Cañas', NULL, NULL, 1, '2026-06-05 20:03:14', '2026-06-09 08:57:36');
INSERT INTO `teams` (`id`, `name`, `category`, `season`, `coach`, `assistant_coach`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (5, 'CB Tomelloso Minibasket', 'Minibasket', '2025/2026', 'Por confirmar', NULL, NULL, 1, '2026-06-05 20:03:14', '2026-06-05 20:03:14');
INSERT INTO `teams` (`id`, `name`, `category`, `season`, `coach`, `assistant_coach`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES (7, 'CB Tomelloso U19 Verde', 'Junior U19', '2025/2026', 'Por confirmar', NULL, NULL, 1, '2026-06-09 08:48:31', '2026-06-09 08:48:31');

DROP TABLE IF EXISTS `users`;
CREATE TABLE "users" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "email" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "name" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "role" enum('admin','editor','socio','visitante') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'visitante',
  "avatar_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "is_active" tinyint(1) NOT NULL DEFAULT '1',
  "refresh_token" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "passwordHash" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  "updated_at" datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY ("id"),
  UNIQUE KEY "IDX_97672ac88f789774dd47f7c8be" ("email")
);

INSERT INTO `users` (`id`, `email`, `name`, `role`, `avatar_url`, `is_active`, `refresh_token`, `passwordHash`, `created_at`, `updated_at`) VALUES (1, 'admin@cbtomelloso.com', 'Admin', 'admin', NULL, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AY2J0b21lbGxvc28uY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgwOTA2Njg4LCJleHAiOjE3ODE1MTE0ODh9.OCnLMXOAmLH4H3mtpYM4GgwvsFzuI5M2VfGZWJemUQ0', '$2b$12$hecpjnu4y7RxIIcatubiA.JMeMuGCWY6bDEfmAcbzjlw5bZ0lP6de', '2026-06-07 23:23:31', '2026-06-08 08:18:08');

SET FOREIGN_KEY_CHECKS = 1;
