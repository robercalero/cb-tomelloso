-- ============================================================
-- ESQUEMA COMPLETO — CB TOMELLOSO
-- MariaDB / MySQL
-- Ejecutar en HeidiSQL o por CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS `cbtomelloso`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'cbtomelloso_user'@'localhost'
  IDENTIFIED BY 'CbTom2025!Secure';

GRANT ALL PRIVILEGES ON `cbtomelloso`.* TO 'cbtomelloso_user'@'localhost';
FLUSH PRIVILEGES;

USE cbtomelloso;

-- -----------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `email`           VARCHAR(255)    NOT NULL UNIQUE,
  `password_hash`   VARCHAR(255)    NOT NULL,
  `name`            VARCHAR(100)    NOT NULL,
  `role`            ENUM('admin','editor','socio','visitante') NOT NULL DEFAULT 'visitante',
  `avatar_url`      VARCHAR(500)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `refresh_token`   VARCHAR(500)    NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. teams
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teams` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)    NOT NULL,
  `category`        ENUM(
                      'Senior Autonómica',
                      'Senior Zonal',
                      'Júnior',
                      'Cadete',
                      'Infantil',
                      'Alevín',
                      'Benjamín',
                      'Minibasket'
                    ) NOT NULL,
  `season`          VARCHAR(10)     NOT NULL,
  `coach`           VARCHAR(100)    NULL,
  `assistant_coach` VARCHAR(100)    NULL,
  `photo_url`       VARCHAR(500)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teams_category` (`category`),
  INDEX `idx_teams_season` (`season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. players
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `players` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `team_id`         INT UNSIGNED    NOT NULL,
  `name`            VARCHAR(100)    NOT NULL,
  `surname`         VARCHAR(100)    NOT NULL,
  `dorsal`          TINYINT UNSIGNED NULL,
  `position`        ENUM('Base','Escolta','Alero','Ala-Pívot','Pívot') NULL,
  `nationality`     VARCHAR(60)     NOT NULL DEFAULT 'España',
  `birth_year`      YEAR            NULL,
  `height_cm`       SMALLINT UNSIGNED NULL,
  `photo_url`       VARCHAR(500)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_player_dorsal_team` (`team_id`, `dorsal`),
  INDEX `idx_players_team` (`team_id`),
  CONSTRAINT `fk_players_team` FOREIGN KEY (`team_id`)
    REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. matches
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `matches` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `team_id`         INT UNSIGNED    NOT NULL,
  `home_team`       VARCHAR(100)    NOT NULL,
  `away_team`       VARCHAR(100)    NOT NULL,
  `home_team_logo`  VARCHAR(500)    NULL,
  `away_team_logo`  VARCHAR(500)    NULL,
  `match_date`      DATE            NOT NULL,
  `match_time`      TIME            NOT NULL,
  `competition`     VARCHAR(100)    NOT NULL,
  `venue`           VARCHAR(200)    NOT NULL,
  `is_home`         TINYINT(1)      NOT NULL DEFAULT 1,
  `score_home`      TINYINT UNSIGNED NULL,
  `score_away`      TINYINT UNSIGNED NULL,
  `status`          ENUM('scheduled','live','finished','postponed','cancelled')
                    NOT NULL DEFAULT 'scheduled',
  `notes`           TEXT            NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_matches_team` (`team_id`),
  INDEX `idx_matches_date` (`match_date`),
  INDEX `idx_matches_status` (`status`),
  CONSTRAINT `fk_matches_team` FOREIGN KEY (`team_id`)
    REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. news
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `author_id`       INT UNSIGNED    NULL,
  `title`           VARCHAR(255)    NOT NULL,
  `slug`            VARCHAR(255)    NOT NULL UNIQUE,
  `excerpt`         VARCHAR(500)    NOT NULL,
  `content`         LONGTEXT        NOT NULL,
  `category`        ENUM('resultado','club','cantera','evento','general')
                    NOT NULL DEFAULT 'general',
  `image_url`       VARCHAR(500)    NULL,
  `is_published`    TINYINT(1)      NOT NULL DEFAULT 0,
  `published_at`    TIMESTAMP       NULL,
  `views`           INT UNSIGNED    NOT NULL DEFAULT 0,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_news_slug` (`slug`),
  INDEX `idx_news_category` (`category`),
  INDEX `idx_news_published` (`is_published`, `published_at`),
  FULLTEXT INDEX `ft_news_search` (`title`, `excerpt`, `content`),
  CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. sponsors
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sponsors` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)    NOT NULL,
  `logo_url`        VARCHAR(500)    NOT NULL,
  `website_url`     VARCHAR(500)    NULL,
  `tier`            ENUM('principal','oro','plata','bronce')
                    NOT NULL DEFAULT 'bronce',
  `description`     TEXT            NULL,
  `contact_name`    VARCHAR(100)    NULL,
  `contact_email`   VARCHAR(255)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `sort_order`      TINYINT UNSIGNED NOT NULL DEFAULT 99,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sponsors_tier` (`tier`),
  INDEX `idx_sponsors_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 7. gallery
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `team_id`         INT UNSIGNED    NULL,
  `title`           VARCHAR(255)    NULL,
  `media_type`      ENUM('image','video') NOT NULL DEFAULT 'image',
  `url`             VARCHAR(500)    NOT NULL,
  `thumbnail_url`   VARCHAR(500)    NULL,
  `season`          VARCHAR(10)     NULL,
  `event_name`      VARCHAR(100)    NULL,
  `taken_at`        DATE            NULL,
  `is_published`    TINYINT(1)      NOT NULL DEFAULT 1,
  `sort_order`      SMALLINT UNSIGNED NOT NULL DEFAULT 99,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_gallery_team` (`team_id`),
  INDEX `idx_gallery_season` (`season`),
  INDEX `idx_gallery_type` (`media_type`),
  CONSTRAINT `fk_gallery_team` FOREIGN KEY (`team_id`)
    REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 8. activities
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `title`           VARCHAR(255)    NOT NULL,
  `description`     TEXT            NULL,
  `activity_type`   ENUM('torneo','escuela','evento','copa','amistoso','otro')
                    NOT NULL DEFAULT 'otro',
  `start_date`      DATE            NOT NULL,
  `end_date`        DATE            NULL,
  `venue`           VARCHAR(200)    NULL,
  `image_url`       VARCHAR(500)    NULL,
  `is_published`    TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_activities_type` (`activity_type`),
  INDEX `idx_activities_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 9. contact_messages
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)    NOT NULL,
  `email`           VARCHAR(255)    NOT NULL,
  `subject`         ENUM('general','socio','patrocinio','prensa','otro')
                    NOT NULL DEFAULT 'general',
  `message`         TEXT            NOT NULL,
  `ip_address`      VARCHAR(45)     NULL,
  `is_read`         TINYINT(1)      NOT NULL DEFAULT 0,
  `replied_at`      TIMESTAMP       NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_contact_read` (`is_read`),
  INDEX `idx_contact_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 10. members
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `members` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED    NULL,
  `name`            VARCHAR(100)    NOT NULL,
  `email`           VARCHAR(255)    NOT NULL,
  `phone`           VARCHAR(20)     NULL,
  `member_type`     ENUM('adulto','juvenil','familia','honorario')
                    NOT NULL DEFAULT 'adulto',
  `member_number`   VARCHAR(20)     NULL UNIQUE,
  `joined_at`       DATE            NOT NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_members_email` (`email`),
  INDEX `idx_members_active` (`is_active`),
  CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
